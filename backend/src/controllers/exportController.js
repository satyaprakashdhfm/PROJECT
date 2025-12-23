/**
 * User Story 6: Data Export
 * Description: As a user, I should be able to export my expense data to Excel or PDF formats.
 * 
 * Features:
 * - exportToExcel() - Export all expenses to Excel file
 * - exportToPDF() - Export all expenses to PDF file
 */

const Expense = require('../model/Expense')
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')

exports.exportToExcel = async(req,res) => {
    try{
        const expenses = await Expense.find({user: req.user.id}).sort({date: -1})

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Expenses')

        // Add headers
        worksheet.columns = [
            {header: 'Date', key: 'date', width: 15},
            {header: 'Category', key: 'category', width: 15},
            {header: 'Description', key: 'description', width: 30},
            {header: 'Merchant', key: 'merchant', width: 20},
            {header: 'Amount', key: 'amount', width: 15}
        ]

        // Add data
        expenses.forEach(exp => {
            worksheet.addRow({
                date: exp.date.toISOString().split('T')[0],
                category: exp.category,
                description: exp.description,
                merchant: exp.merchant || 'N/A',
                amount: exp.amount
            })
        })

        // Style header row
        worksheet.getRow(1).font = {bold: true}
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFD3D3D3'}
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename=expenses.xlsx')

        await workbook.xlsx.write(res)
        res.end()
    }
    catch(error){
        res.status(500).json({error: "Failed to export to Excel"})
    }
}

exports.exportToPDF = async(req,res) => {
    try{
        const expenses = await Expense.find({user: req.user.id}).sort({date: -1})

        const doc = new PDFDocument()
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=expenses.pdf')

        doc.pipe(res)

        // Add title
        doc.fontSize(20).text('Expense Report', {align: 'center'})
        doc.moveDown()

        // Add table header
        doc.fontSize(12).text('Date          Category          Description              Merchant              Amount', {
            underline: true
        })
        doc.moveDown(0.5)

        // Add expenses
        let total = 0
        expenses.forEach(exp => {
            const date = exp.date.toISOString().split('T')[0]
            const merchant = (exp.merchant || 'N/A').substring(0,18).padEnd(20)
            const line = `${date}  ${exp.category.padEnd(15)}  ${exp.description.substring(0,22).padEnd(25)}  ${merchant}  ₹${exp.amount}`
            doc.fontSize(10).text(line)
            total += exp.amount
        })

        // Add total
        doc.moveDown()
        doc.fontSize(12).text(`Total: ₹${total}`, {align: 'right', bold: true})

        doc.end()
    }
    catch(error){
        res.status(500).json({error: "Failed to export to PDF"})
    }
}
