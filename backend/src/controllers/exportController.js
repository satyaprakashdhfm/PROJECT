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

        const doc = new PDFDocument({ margin: 50 })
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=expenses.pdf')

        doc.pipe(res)

        // Add title
        doc.fontSize(20).text('Expense Report', { align: 'center' })
        doc.moveDown(2)

        // Define column positions
        const col1 = 50   // Date
        const col2 = 120  // Category
        const col3 = 210  // Description
        const col4 = 340  // Merchant
        const col5 = 480  // Amount (right-aligned)

        let y = doc.y

        // Add table header with underline
        doc.fontSize(12).font('Helvetica-Bold')
        doc.text('Date', col1, y, { width: 70, align: 'left' })
        doc.text('Category', col2, y, { width: 90, align: 'left' })
        doc.text('Description', col3, y, { width: 130, align: 'left' })
        doc.text('Merchant', col4, y, { width: 140, align: 'left' })
        doc.text('Amount', col5, y, { width: 70, align: 'right' })
        
        y += 20
        doc.moveTo(col1, y).lineTo(550, y).stroke()
        y += 10

        // Add expenses
        doc.font('Helvetica').fontSize(10)
        let total = 0
        
        expenses.forEach(exp => {
            // Check if we need a new page
            if (y > 720) {
                doc.addPage()
                y = 50
            }

            const date = exp.date.toISOString().split('T')[0]
            const category = exp.category || 'N/A'
            const description = exp.description.length > 25 ? exp.description.substring(0, 22) + '...' : exp.description
            const merchant = exp.merchant ? (exp.merchant.length > 20 ? exp.merchant.substring(0, 17) + '...' : exp.merchant) : 'N/A'
            const amount = exp.amount.toString()

            doc.text(date, col1, y, { width: 70, align: 'left' })
            doc.text(category, col2, y, { width: 90, align: 'left' })
            doc.text(description, col3, y, { width: 130, align: 'left' })
            doc.text(merchant, col4, y, { width: 140, align: 'left' })
            doc.text(amount, col5, y, { width: 70, align: 'right' })
            
            y += 20
            total += exp.amount
        })

        // Add total in the center
        y += 20
        doc.moveTo(col1, y).lineTo(550, y).stroke()
        y += 15
        doc.fontSize(14).font('Helvetica-Bold')
        doc.text(`Total: ${total.toFixed(2)}`, 50, y, { width: 500, align: 'center' })

        doc.end()
    }
    catch(error){
        res.status(500).json({error: "Failed to export to PDF"})
    }
}
