import { AdminApiError } from './adminApiError'

const ADMIN_EXPORT_ENDPOINT = `${import.meta.env.BASE_URL}api/admin-export`

export async function downloadAdministrativeExport(adminKey, section, format) {
  const params = new URLSearchParams({ section, format })
  const response = await fetch(`${ADMIN_EXPORT_ENDPOINT}?${params}`, {
    headers: {
      Authorization: `Bearer ${adminKey}`
    }
  })

  if (!response.ok) {
    let payload = {}
    try {
      payload = await response.json()
    } catch {
      // Le statut HTTP reste disponible même si la réponse est illisible.
    }
    throw new AdminApiError(
      payload.message ?? 'L’export ne peut pas être téléchargé.',
      response.status,
      payload.code
    )
  }

  const disposition = response.headers.get('content-disposition') ?? ''
  const filename =
    disposition.match(/filename="([^"]+)"/)?.[1]
    ?? `academie-salsabil-${section}.${format}`
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
