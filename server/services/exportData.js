import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'
import expenseService from './expenseService.js'
import { format } from 'date-fns'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  async exportToExcel({ userId, expensesIds }) {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Expenses')

      let expenses = await expenseService.getListByIds({
        userId,
        expensesIds,
      })

      let total = 0
      expenses.forEach((expense) => {
        total += Number(expense.price)
      })

      if (expenses.length === 0) {
        throw new Error("Nessun dato trovato per l'export.")
      }

      worksheet.columns = [
        { header: 'Categoria', key: 'category', width: 45 },
        { header: 'Descrizione', key: 'description', width: 60 },
        { header: 'Prezzo', key: 'price', width: 30 },
        { header: 'Data', key: 'date', width: 30 },
      ]

      worksheet.getRow(1).height = 20

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D3D3D3' },
        }
        cell.font = {
          bold: true,
          size: 15,
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
      })

      expenses.forEach((e) => {
        const row = worksheet.addRow({
          category: e.category.description,
          description: e.description,
          price: e.price,
          date: format(new Date(e.date), 'dd/MM/yyyy'),
        })

        row.height = 20
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
          }
          cell.font = {
            size: 13,
          }
        })
      })

      worksheet.addRow({})
      worksheet.addRow({
        category: 'TOTALE',
        description: '',
        price: total.toFixed(2) + '€',
        date: '',
      })

      worksheet.getRow(worksheet.lastRow.number - 1).height = 20
      worksheet.getRow(worksheet.lastRow.number).height = 20
      worksheet.getRow(worksheet.lastRow.number).eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        cell.font = {
          bold: true,
          size: 13,
        }
      })

      const reportsFolderPath = path.join(__dirname, 'exports')

      if (!fs.existsSync(reportsFolderPath)) {
        fs.mkdirSync(reportsFolderPath)
      }

      const fileName = `spese_${Date.now()}.xlsx`
      const filePath = path.join(reportsFolderPath, fileName)

      await workbook.xlsx.writeFile(filePath)
      console.log('File Excel generato:', filePath)

      const fileUrl = `/exports/${fileName}`
      return { url: fileUrl }
    } catch (error) {
      console.error('Errore durante la generazione del report:', error)
      throw new Error('Errore durante la generazione del report.')
    }
  },
}
