import { readAdminJsonResponse } from './adminApiError'

const SUPPORT_REQUEST_ENDPOINT = `${import.meta.env.BASE_URL}api/support-requests`

async function requestAdminApi(adminKey, options = {}) {
  const response = await fetch(SUPPORT_REQUEST_ENDPOINT + (options.query ?? ''), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminKey}`,
      ...options.headers
    }
  })

  return readAdminJsonResponse(response)
}

export async function getSupportRequests(
  adminKey,
  { page = 1, pageSize = 10, search = '', status = 'all', sort = 'newest' } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    search,
    status,
    sort
  })

  const payload = await requestAdminApi(adminKey, {
    query: `?${params.toString()}`
  })

  if (payload.pagination && Array.isArray(payload.requests)) {
    return payload
  }

  // Netlify Dev peut conserver temporairement une ancienne version de la
  // Function après une modification. Cette compatibilité évite de bloquer
  // l'administration pendant le redémarrage du serveur local.
  const normalizedSearch = search
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
  const filtered = (Array.isArray(payload.requests) ? payload.requests : [])
    .filter((request) => {
      if (status !== 'all' && request.status !== status) return false
      if (!normalizedSearch) return true

      return [
        request.reference,
        request.contact?.parentName,
        request.contact?.email,
        request.contact?.phone,
        request.student?.level,
        ...(request.request?.subjects ?? [])
      ]
        .join(' ')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .includes(normalizedSearch)
    })
    .sort((left, right) => {
      const comparison = left.createdAt.localeCompare(right.createdAt)
      return sort === 'oldest' ? comparison : -comparison
    })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (currentPage - 1) * pageSize

  return {
    requests: filtered.slice(startIndex, startIndex + pageSize),
    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
      from: totalItems === 0 ? 0 : startIndex + 1,
      to: Math.min(startIndex + pageSize, totalItems)
    }
  }
}

export async function changeSupportRequestStatus(adminKey, requestId, status) {
  const payload = await requestAdminApi(adminKey, {
    method: 'PATCH',
    body: JSON.stringify({ requestId, status })
  })
  return payload.request
}

export async function removeSupportRequest(adminKey, requestId) {
  await requestAdminApi(adminKey, {
    method: 'DELETE',
    query: `?requestId=${encodeURIComponent(requestId)}`
  })
}
