export const dateUtils = {
  getCurrentMonthYear: () => {
    const date = new Date()
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  },
  
  getDefaultDueDate: () => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // 7 days from now
    return date.toISOString().split('T')[0]
  },
  
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  },
  
  formatDateTime: (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}