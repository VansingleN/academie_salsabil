const ALLOWED_SORTS = new Set(['newest', 'oldest'])
const DEFAULT_PAGE_SIZE = 10

export class OrderAdministrationError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'OrderAdministrationError'
    this.code = code
    this.status = status
  }
}

function cleanText(value, maxLength = 120) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (text.length > maxLength) {
    throw new OrderAdministrationError(
      'INVALID_FILTER',
      'Un critère de recherche est trop long.'
    )
  }
  return text
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function createOrderView(order) {
  const students = order.enrollment?.students ?? []
  const entries = (order.items ?? []).map((item) => {
    const student = students.find(
      (candidate) => candidate.cartItemId === item.cartItemId
    )

    return {
      cartItemId: item.cartItemId,
      offerId: item.offerId,
      curriculum: item.curriculum,
      grade: item.grade,
      plan: item.plan,
      planId: item.planId,
      billingCountry: item.billingCountry,
      selectedOptions: item.selectedOptions ?? [],
      firstPaymentExcludingTax:
        item.paymentSchedule?.totals?.firstPaymentExcludingTax ?? 0,
      contractTotalExcludingTax:
        item.paymentSchedule?.totals?.contractTotalExcludingTax ?? 0,
      futurePaymentCount:
        item.paymentSchedule?.futurePayments?.length ?? 0,
      manualPaymentCount:
        item.paymentSchedule?.manualPayments?.length ?? 0,
      student: student
        ? {
            firstName: student.firstName,
            lastName: student.lastName,
            birthDate: student.birthDate ?? null,
            age: student.age ?? null,
            schoolGrade: student.schoolGrade ?? null,
            schoolingStatus: student.schoolingStatus ?? null,
            learningObjectives: student.learningObjectives ?? null,
            accommodations: student.accommodations ?? null,
            arabicLevel: student.arabicLevel ?? null,
            quranLevel: student.quranLevel ?? null
          }
        : null
    }
  })

  return {
    id: order.id,
    publicOrderNumber: order.publicOrderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    scheduleStatus: order.scheduleStatus,
    currency: order.currency,
    itemCount: order.itemCount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    checkoutCompletedAt: order.checkoutCompletedAt ?? null,
    checkoutSessionId: order.checkoutSessionId ?? null,
    subscriptionId: order.subscriptionId ?? null,
    lastInvoiceId: order.lastInvoiceId ?? null,
    paymentSummary: order.paymentSummary ?? {
      firstPaymentExcludingTax: 0,
      futurePaymentsExcludingTax: 0,
      contractTotalExcludingTax: 0,
      installmentCount: 0
    },
    guardian: order.enrollment?.guardian ?? null,
    billingAddress: order.enrollment?.billingAddress ?? null,
    entries,
    eventHistory: order.eventHistory ?? []
  }
}

export function listAdministrativeOrders(
  orders,
  {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    status = 'all',
    sort = 'newest'
  } = {}
) {
  const size = Math.min(50, Math.max(1, Number.parseInt(pageSize, 10) || 10))
  const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const query = cleanText(search)
  const selectedStatus = cleanText(status, 50) || 'all'
  const selectedSort = ALLOWED_SORTS.has(sort) ? sort : 'newest'
  const needle = normalize(query)

  const filtered = orders
    .filter((order) => {
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false
      }
      if (!needle) return true

      const guardian = order.enrollment?.guardian
      const students = order.enrollment?.students ?? []
      const values = [
        order.publicOrderNumber,
        order.id,
        order.checkoutSessionId,
        guardian?.firstName,
        guardian?.lastName,
        guardian?.email,
        guardian?.phone,
        ...students.flatMap((student) => [
          student.firstName,
          student.lastName
        ]),
        ...(order.items ?? []).flatMap((item) => [
          item.curriculum,
          item.grade,
          item.offerId
        ])
      ]

      return normalize(values.join(' ')).includes(needle)
    })
    .sort((left, right) => {
      const comparison = left.createdAt.localeCompare(right.createdAt)
      return selectedSort === 'oldest' ? comparison : -comparison
    })

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / size))
  const currentPage = Math.min(requestedPage, totalPages)
  const start = (currentPage - 1) * size

  return {
    orders: filtered.slice(start, start + size).map(createOrderView),
    pagination: {
      page: currentPage,
      pageSize: size,
      totalItems,
      totalPages,
      from: totalItems === 0 ? 0 : start + 1,
      to: Math.min(start + size, totalItems)
    }
  }
}
