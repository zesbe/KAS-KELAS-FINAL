// Report Templates untuk Dashboard KasKelas

export interface ReportData {
  month: string
  year: string
  className: string
  treasurerName: string
  teacherName: string
  startBalance: number
  totalIncome: number
  totalExpense: number
  endBalance: number
  expenses: any[]
  students: any[]
  categories: any[]
  paymentMethods: any[]
  pendingExpenses: any[]
}

export interface WhatsAppData {
  studentName: string
  parentName: string
  amount: number
  dueDate: string
  paymentMethod: string
  accountNumber: string
  treasurerName: string
  treasurerPhone: string
}

export class ReportTemplates {
  
  // Template Laporan Keuangan Bulanan
  static generateMonthlyReport(data: ReportData): string {
    const {
      month, year, className, treasurerName, teacherName,
      startBalance, totalIncome, totalExpense, endBalance,
      expenses, categories, paymentMethods, pendingExpenses
    } = data

    // Hitung statistik per kategori
    const categoryStats = categories.map(cat => {
      const categoryExpenses = expenses.filter(exp => exp.category_id === cat.id)
      const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const percentage = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : '0'
      return { name: cat.name, total, percentage, count: categoryExpenses.length }
    })

    // Hitung statistik metode pembayaran
    const paymentStats = paymentMethods.map(method => {
      const methodExpenses = expenses.filter(exp => exp.metode_pembayaran === method.value)
      const total = methodExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const percentage = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : '0'
      return { method: method.label, total, percentage }
    })

    return `
# 📊 LAPORAN KEUANGAN ${className.toUpperCase()}
**Bulan: ${month} ${year}**  
**Periode: 1 ${month} ${year} s/d 31 ${month} ${year}**  
**Bendahara: ${treasurerName}**

---

## 💰 RINGKASAN KEUANGAN

| **Keterangan** | **Jumlah** |
|---|---:|
| **Saldo Awal Bulan** | Rp ${startBalance.toLocaleString('id-ID')} |
| **Total Pemasukan** | Rp ${totalIncome.toLocaleString('id-ID')} |
| **Total Pengeluaran** | Rp ${totalExpense.toLocaleString('id-ID')} |
| **Saldo Akhir Bulan** | Rp ${endBalance.toLocaleString('id-ID')} |

---

## 📉 PENGELUARAN BULAN INI

${categoryStats.map(cat => `
### ${cat.name} - Rp ${cat.total.toLocaleString('id-ID')} (${cat.percentage}%)
| **Tanggal** | **Keterangan** | **Tempat** | **Jumlah** |
|:---:|---|---|---:|
${expenses
  .filter(exp => exp.expense_categories?.name === cat.name)
  .map(exp => `| ${new Date(exp.tanggal).toLocaleDateString('id-ID')} | ${exp.title} | ${exp.toko_tempat || '-'} | Rp ${exp.amount.toLocaleString('id-ID')} |`)
  .join('\n')}
`).join('')}

---

## 📊 ANALISIS PENGELUARAN

### 📈 **Persentase per Kategori**
${categoryStats.map(cat => `- **${cat.name}**: ${cat.percentage}% (${cat.count} transaksi)`).join('\n')}

### 💳 **Metode Pembayaran**
${paymentStats.map(stat => `- **${stat.method}**: Rp ${stat.total.toLocaleString('id-ID')} (${stat.percentage}%)`).join('\n')}

---

## 📋 PENGELUARAN BELUM DISETUJUI

${pendingExpenses.length > 0 ? `
| **Tanggal** | **Keterangan** | **Kategori** | **Jumlah** |
|:---:|---|:---:|---:|
${pendingExpenses.map(exp => `| ${new Date(exp.tanggal).toLocaleDateString('id-ID')} | ${exp.title} | ${exp.expense_categories?.name} | Rp ${exp.amount.toLocaleString('id-ID')} |`).join('\n')}

**Total Pending: Rp ${pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('id-ID')}**
` : '**Tidak ada pengeluaran yang pending** ✅'}

---

## 📞 KONTAK

**Bendahara Kelas:** ${treasurerName}  
**Wali Kelas:** ${teacherName}

---

*Laporan dibuat otomatis pada ${new Date().toLocaleDateString('id-ID')} menggunakan Sistem KasKelas*

**Mengetahui,**

**Wali Kelas**  
( ${teacherName} )

**Bendahara Kelas**  
( ${treasurerName} )
`
  }

  // Template Surat Tagihan
  static generatePaymentNotice(data: WhatsAppData): string {
    const { studentName, parentName, amount, dueDate, treasurerName } = data

    return `
# 💌 SURAT TAGIHAN KAS KELAS

**Kepada Yth.**  
**Bapak/Ibu ${parentName}**  
**Orang Tua/Wali dari ${studentName}**  
**di tempat**

---

**Assalamu'alaikum Wr. Wb.**

Dengan hormat, kami sampaikan tagihan iuran kas kelas:

## 👨‍👩‍👧‍👦 DATA SISWA

| **Keterangan** | **Data** |
|---|---|
| **Nama Siswa** | ${studentName} |
| **Nama Orang Tua** | ${parentName} |
| **Jumlah Tagihan** | Rp ${amount.toLocaleString('id-ID')} |
| **Jatuh Tempo** | ${new Date(dueDate).toLocaleDateString('id-ID')} |

## 🏦 CARA PEMBAYARAN

### **Transfer Bank**
- **No. Rekening:** ${data.accountNumber}
- **Atas Nama:** ${treasurerName}

### **Tunai**
- **Diserahkan kepada:** ${treasurerName}
- **Waktu:** Setiap hari sekolah (07.00 - 07.30)

---

**${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}**

**Hormat kami,**  
**Bendahara Kelas**  
**( ${treasurerName} )**

*Surat dibuat otomatis oleh Sistem KasKelas*
`
  }

  // Template WhatsApp Reminder
  static generateWhatsAppReminder(data: WhatsAppData, type: 'reminder' | 'overdue' | 'confirmation'): string {
    const { studentName, parentName, amount, dueDate, treasurerName, treasurerPhone } = data

    switch (type) {
      case 'reminder':
        return `🔔 *PENGINGAT KAS KELAS*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

Kami ingatkan bahwa iuran kas kelas atas nama *${studentName}* akan jatuh tempo pada ${new Date(dueDate).toLocaleDateString('id-ID')}.

💰 *Rincian:*
• Jumlah: *Rp ${amount.toLocaleString('id-ID')}*
• Jatuh Tempo: ${new Date(dueDate).toLocaleDateString('id-ID')}

🏦 *Cara Bayar:*
• Transfer: ${data.accountNumber}
• Tunai: Serahkan ke bendahara

Mohon konfirmasi setelah pembayaran ya Bapak/Ibu 📸

Terima kasih 🙏
*${treasurerName}*
*Bendahara Kelas*`

      case 'overdue':
        const daysOverdue = Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
        return `⚠️ *TAGIHAN TERLAMBAT*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

Iuran kas kelas atas nama *${studentName}* sudah melewati jatuh tempo ${daysOverdue} hari.

💰 *Jumlah:* Rp ${amount.toLocaleString('id-ID')}
📅 *Jatuh Tempo:* ${new Date(dueDate).toLocaleDateString('id-ID')}

Mohon segera melakukan pembayaran ya Bapak/Ibu 🙏

*${treasurerName}*
*Bendahara Kelas*`

      case 'confirmation':
        return `✅ *PEMBAYARAN DITERIMA*

Assalamu'alaikum Bapak/Ibu ${parentName} 🙏

Alhamdulillah, pembayaran kas kelas atas nama *${studentName}* sudah kami terima:

💰 *Jumlah:* Rp ${amount.toLocaleString('id-ID')}
📅 *Tanggal:* ${new Date().toLocaleDateString('id-ID')}
✅ *Status:* LUNAS

Terima kasih atas kerjasamanya 🙏

*${treasurerName}*
*Bendahara Kelas*`

      default:
        return ''
    }
  }

  // Template Proposal Pengeluaran
  static generateExpenseProposal(data: {
    title: string
    category: string
    amount: number
    description: string
    items: Array<{ name: string, qty: number, price: number }>
    purpose: string
    proposedBy: string
    dateNeeded: string
    store: string
  }): string {
    const { title, category, amount, description, items, purpose, proposedBy, dateNeeded, store } = data

    return `
# 📋 PROPOSAL PENGELUARAN KAS KELAS

**Tanggal Proposal:** ${new Date().toLocaleDateString('id-ID')}  
**Diajukan oleh:** ${proposedBy}

---

## 📝 DETAIL PENGELUARAN

### **Judul:** ${title}
### **Kategori:** ${category}
### **Total Anggaran:** Rp ${amount.toLocaleString('id-ID')}
### **Tanggal Dibutuhkan:** ${new Date(dateNeeded).toLocaleDateString('id-ID')}

### **Tujuan & Manfaat:**
${purpose}

### **Deskripsi:**
${description}

---

## 🛒 RINCIAN PEMBELIAN

| **No** | **Nama Barang** | **Qty** | **Harga Satuan** | **Total** |
|:---:|---|:---:|---:|---:|
${items.map((item, index) => 
  `| ${index + 1} | ${item.name} | ${item.qty} | Rp ${item.price.toLocaleString('id-ID')} | Rp ${(item.qty * item.price).toLocaleString('id-ID')} |`
).join('\n')}
|   |   |   | **TOTAL** | **Rp ${amount.toLocaleString('id-ID')}** |

---

## 🏪 TEMPAT PEMBELIAN
**Nama Toko:** ${store}

---

## ✅ PERSETUJUAN

**Diajukan oleh:**  
**Nama:** ${proposedBy}  
**Tanggal:** ${new Date().toLocaleDateString('id-ID')}

**Status:** ⏳ Menunggu Persetujuan

---

*Proposal dibuat menggunakan Sistem KasKelas*
`
  }

  // Template Export untuk Print/PDF
  static generatePrintableReport(data: ReportData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan ${data.className}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .amount { text-align: right; }
        .signature { margin-top: 50px; display: flex; justify-content: space-between; }
        .sign-box { text-align: center; width: 200px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN KEUANGAN ${data.className.toUpperCase()}</h1>
        <h2>${data.month} ${data.year}</h2>
        <p>Bendahara: ${data.treasurerName}</p>
    </div>

    <table class="table">
        <tr><th>Keterangan</th><th>Jumlah</th></tr>
        <tr><td>Saldo Awal Bulan</td><td class="amount">Rp ${data.startBalance.toLocaleString('id-ID')}</td></tr>
        <tr><td>Total Pemasukan</td><td class="amount">Rp ${data.totalIncome.toLocaleString('id-ID')}</td></tr>
        <tr><td>Total Pengeluaran</td><td class="amount">Rp ${data.totalExpense.toLocaleString('id-ID')}</td></tr>
        <tr><td><strong>Saldo Akhir Bulan</strong></td><td class="amount"><strong>Rp ${data.endBalance.toLocaleString('id-ID')}</strong></td></tr>
    </table>

    <h3>Rincian Pengeluaran</h3>
    <table class="table">
        <tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Tempat</th><th>Jumlah</th></tr>
        ${data.expenses.map(exp => 
          `<tr>
            <td>${new Date(exp.tanggal).toLocaleDateString('id-ID')}</td>
            <td>${exp.title}</td>
            <td>${exp.expense_categories?.name || '-'}</td>
            <td>${exp.toko_tempat || '-'}</td>
            <td class="amount">Rp ${exp.amount.toLocaleString('id-ID')}</td>
          </tr>`
        ).join('')}
    </table>

    <div class="signature">
        <div class="sign-box">
            <p>Mengetahui,<br><strong>Wali Kelas</strong></p>
            <br><br><br>
            <p>( ${data.teacherName} )</p>
        </div>
        <div class="sign-box">
            <p><strong>Bendahara Kelas</strong></p>
            <br><br><br>
            <p>( ${data.treasurerName} )</p>
        </div>
    </div>

    <p style="text-align: center; margin-top: 30px; font-size: 12px;">
        Laporan dibuat pada ${new Date().toLocaleDateString('id-ID')} menggunakan Sistem KasKelas
    </p>
</body>
</html>
`
  }
}

// Helper functions untuk format data
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('id-ID')
}

export const calculatePercentage = (part: number, total: number): string => {
  return total > 0 ? ((part / total) * 100).toFixed(1) : '0'
}