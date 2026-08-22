import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { currencyFormatter } from '../../components/Auth/customFetch';

export interface CommissionPdfRecord {
     organization_name: string;
     organization_phone: string;
     total_services: number;
     total_payable: string;
     total_paid: string;
     commission_earned_total: string;
}

export function exportCommissionDataToPDF(commissionData: CommissionPdfRecord[], startDate: string, endDate: string) {
     const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

     // Use Times New Roman if available
     if (doc.getFontList && doc.getFontList()['Times New Roman']) {
          doc.setFont('Times New Roman', 'bold');
     } else {
          doc.setFont('times', 'bold');
     }

     doc.setFontSize(22);
     doc.text('Organizations Commission Report', 14, 18);
     doc.setFontSize(14);
     doc.setFont('times', 'normal');
     doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);

     autoTable(doc, {
          startY: 36,
          head: [[
               'Organization Name',
               'Phone',
               'Services',
               'Total Payable',
               'Total Paid',
               'Commission Earned',
          ]],
          body: commissionData.map(record => [
               record.organization_name,
               record.organization_phone,
               record.total_services,
               currencyFormatter.format(Number(record.total_payable)),
               currencyFormatter.format(Number(record.total_paid)),
               currencyFormatter.format(Number(record.commission_earned_total)),
          ]),
          styles: { fontSize: 12, font: 'times', fontStyle: 'bold' },
          headStyles: { fillColor: [22, 160, 133], fontSize: 13, font: 'times', fontStyle: 'bold' },
          bodyStyles: { font: 'times', fontStyle: 'bold' },
     });

     doc.save(`commission-report-${startDate}-to-${endDate}.pdf`);
}
