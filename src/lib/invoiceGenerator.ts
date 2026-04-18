import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  residentName: string;
  apartmentNumber: string;
  buildingName: string;
  buildingAddress: string;
  items: { description: string; amount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentDate?: string;
  paymentMethod?: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with Gradient Effect
  doc.setFillColor(13, 34, 96);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNDIX', 20, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Property Management Platform', 20, 40);
  
  // Invoice Title Box
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(pageWidth - 65, 15, 50, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 40, 32, { align: 'center' });
  
  // Invoice Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 60, pageWidth - 40, 35, 3, 3, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Number: ${data.invoiceNumber}`, pageWidth - 50, 72, { align: 'right' });
  doc.text(`Issue Date: ${data.date}`, pageWidth - 50, 80, { align: 'right' });
  doc.text(`Due Date: ${data.dueDate}`, pageWidth - 50, 88, { align: 'right' });
  
  // Bill To Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 105, pageWidth - 40, 45, 3, 3, 'F');
  doc.setTextColor(13, 34, 96);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 30, 120);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.residentName, 30, 132);
  doc.text(`Apartment ${data.apartmentNumber}`, 30, 142);
  doc.text(data.buildingName, 30, 152);
  doc.text(data.buildingAddress, 30, 162);
  
  // Company Details (Right side)
  doc.setTextColor(13, 34, 96);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details:', pageWidth - 70, 120);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${data.status.toUpperCase()}`, pageWidth - 70, 132);
  if (data.paymentDate) {
    doc.text(`Payment Date: ${data.paymentDate}`, pageWidth - 70, 142);
  }
  if (data.paymentMethod) {
    doc.text(`Payment Method: ${data.paymentMethod}`, pageWidth - 70, 152);
  }
  
  // Items Table
  const tableData = data.items.map(item => [
    item.description,
    `${item.amount.toLocaleString()} DZD`
  ]);
  
  autoTable(doc, {
    startY: 175,
    head: [['Description', 'Amount (DZD)']],
    body: tableData,
    foot: [
      ['Subtotal', `${data.subtotal.toLocaleString()} DZD`],
      ['Tax (TVA 19%)', `${data.tax.toLocaleString()} DZD`],
      ['Total', `${data.total.toLocaleString()} DZD`]
    ],
    headStyles: { 
      fillColor: [13, 34, 96], 
      textColor: 255, 
      fontStyle: 'bold',
      halign: 'left'
    },
    footStyles: { 
      fillColor: [249, 115, 22], 
      textColor: 255, 
      fontStyle: 'bold',
      halign: 'right'
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 40, halign: 'right' }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Status Badge
  const statusColor = data.status === 'paid' ? [34, 197, 94] : [249, 115, 22];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 55, finalY, 40, 10, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(data.status.toUpperCase(), pageWidth - 35, finalY + 7, { align: 'center' });
  
  // Payment Instructions
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, finalY + 20, pageWidth - 40, 40, 3, 3, 'F');
  doc.setTextColor(13, 34, 96);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Instructions:', 30, finalY + 35);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Bank: Banque d\'Algérie', 30, finalY + 47);
  doc.text('Account: 123 456 789 01', 30, finalY + 55);
  doc.text('RIB: 1234 5678 9012 3456 7890 123', 30, finalY + 63);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your trust in Syndix', pageWidth / 2, 280, { align: 'center' });
  doc.text('Syndix - Digital Property Platform', pageWidth / 2, 288, { align: 'center' });
  
  // Save PDF
  doc.save(`Invoice-${data.invoiceNumber}.pdf`);
};