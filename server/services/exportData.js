import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'
import expenseService from './expenseService.js'
import { format } from 'date-fns'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  async exportToExcel({ userId, startDate, endDate }) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Expenses')

    let expenses = await expenseService.getListWithCategories({
      userId,
      startDate,
      endDate,
    })

    let total = await expenseService.getTotalOfPeriod({
      userId,
      startDate,
      endDate,
    })

    if (expenses.length === 0) {
      throw new Error("Nessun dato trovato per l'export.")
    }

    worksheet.columns = [
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Descrizione', key: 'description', width: 30 },
      { header: 'Prezzo', key: 'price', width: 15 },
      { header: 'Data', key: 'date', width: 15 },
    ]

    expenses.forEach((e) => {
      worksheet.addRow({
        category: e.category.description,
        description: e.description,
        price: e.price,
        date: format(new Date(e.date), 'dd/MM/yyyy'),
      })
    })

    worksheet.addRow({})
    worksheet.addRow({
      category: 'TOTALE',
      description: '',
      price: total,
      date: '',
    })

    const reportsFolderPath = path.join(
      process.env.HOME,
      'Desktop',
      'Spese reports',
    )

    if (!fs.existsSync(reportsFolderPath)) {
      fs.mkdirSync(reportsFolderPath)
    }

    const userDesktopPath = path.join(reportsFolderPath, 'export.xlsx')

    await workbook.xlsx.writeFile(userDesktopPath)
    console.log('File Excel generato:', userDesktopPath)

    return userDesktopPath
  },
}
