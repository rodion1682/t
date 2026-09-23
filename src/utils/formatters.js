import moment from 'moment'
import { SuccessIcon, PendingIcon, ErrorIcon } from '@/components/icons'

export const formatPurchaseStatus = (status) => {
  const statusMap = {
    "processing": { icon: PendingIcon },
    "accepted": { icon: SuccessIcon },
    "completed": { icon: SuccessIcon },
    "denied": { icon: ErrorIcon },
    "deleted": { icon: ErrorIcon },
    "client refused": { icon: ErrorIcon },
    "payment error": { icon: ErrorIcon },
  }

  return statusMap[status.toLowerCase()] || { icon: ErrorIcon }
}

export const formatDepositStatus = (status) => {
  const statusMap = {
    'success': { icon: SuccessIcon },
    'pending': { icon: PendingIcon },
    'error': { icon: ErrorIcon },
  }

  return statusMap[status.toLowerCase()] || { icon: ErrorIcon }
}

export const formatOfferStatus = (status) => {
  const statusMap = {
    'pending': { icon: PendingIcon },
    'offer': { icon: PendingIcon },
    'awaiting_item': { icon: PendingIcon },
    'ready_for_payout': { icon: SuccessIcon },
    'payout_processing': { icon: PendingIcon },
    'approved': { icon: SuccessIcon },
    'declined_by_user': { icon: ErrorIcon },
    'declined_by_service': { icon: ErrorIcon },
  }

  return statusMap[status.toLowerCase()] || { icon: ErrorIcon }
}

export const formatDate = (date, format = 'DD.MM.YYYY') => {
  // console.log(date);
  // console.log(moment.unix(date).format('DD.MM.YYYY'));
  return moment(date).format(format)
}

export const formatAmount = (amount) => {
  return `${parseFloat(amount).toFixed(2)}`
}

export const formatStatus = status => {
  const statusMap = {
    success: { text: 'Successfully', color: 'text-success' },
    completed: { text: 'Successfully', color: 'text-success' },
    accepted: { text: 'Successfully', color: 'text-success' },
    successfully: { text: 'Successfully', color: 'text-success' },

    pending: { text: 'Pending', color: 'text-warning' },
    processing: { text: 'Processing', color: 'text-warning' },
    offer: { text: 'Offer', color: 'text-[#56BBFF]' },

    denied: { text: 'Canceled', color: 'text-error' },
    deleted: { text: 'Canceled', color: 'text-error' },
    declined: { text: 'Canceled', color: 'text-error' },
    canceled: { text: 'Canceled', color: 'text-error' },
    cancelled: { text: 'Canceled', color: 'text-error' },
    clientRefused: { text: 'Canceled', color: 'text-error' },
    client_refused: { text: 'Canceled', color: 'text-error' },
    paymentError: { text: 'Failed', color: 'text-error' },
    payment_error: { text: 'Failed', color: 'text-error' },
    error: { text: 'Failed', color: 'text-error' },
    failed: { text: 'Failed', color: 'text-error' },
    rejected: { text: 'Rejected', color: 'text-error' },

    // Additional sell order statuses
    skinReceived: { text: 'Received', color: 'text-[#56BBFF]' },
    skin_received: { text: 'Received', color: 'text-[#56BBFF]' },
    sold: { text: 'Sold', color: 'text-success' },
    returned: { text: 'Returned', color: 'text-[#A3A3A3]' },
  }

  // Convert status to lowercase for case-insensitive matching
  const statusLower = status?.toLowerCase()
  return (
    statusMap[statusLower] || {
      text: status || 'Processing',
      color: 'text-primary',
    }
  )
}

/**
 * Get status text for display
 * @param {string} status - The status value
 * @returns {string} Formatted status text
 */
export const getStatusText = status => {
  return formatStatus(status).text
}

/**
 * Get status CSS class based on status value
 * @param {string} status - The status value
 * @returns {string} CSS class for the status
 */
export const getStatusClass = status => {
  return formatStatus(status).color
}

/**
 * Format a number with specific number of decimal places
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals)
}

export const firstLetterUppercase = string => {
  return string?.charAt(0)?.toUpperCase() + string?.slice(1)
}

export const getNameFirstPart = string => {
  if (!string) return ''
  const titleParts = string.split('|')
  return titleParts.length > 1
    ? titleParts[0].trim()
    : string
}

export const getNameSecondPart = string => {
  if (!string) return ''
  const titleParts = string.split('|')
  return titleParts.length > 1
    ? titleParts[1].split('(')[0].trim()
    : ''
}
