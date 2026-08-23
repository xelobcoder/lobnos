import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { currencyFormatter } from '../../components/Auth/customFetch';

export interface ClinicianCommissionPdfRecord {
     clinician_name: string;
     clinician_phone: string;
     total_services: number;
     earned_revenue: string;
     cash_collected: string;
     commission_earned_total: string;
}

export function exportClinicianCommissionDataToPDF(commissionData: ClinicianCommissionPdfRecord[], startDate: string, endDate: string) {
     const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

     if (doc.getFontList && doc.getFontList()['Times New Roman']) {
          doc.setFont('Times New Roman', 'bold');
     } else {
          doc.setFont('times', 'bold');
     }

     doc.setFontSize(22);
     doc.text('Clinicians Commission Report', 14, 18);
     doc.setFontSize(14);
     doc.setFont('times', 'normal');
     doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);

     autoTable(doc, {
          startY: 36,
          head: [[
               'Clinician Name',
               'Phone',
               'Services',
               'Total Payable',
               'Total Paid',
               'Commission Earned',
          ]],
          body: commissionData.map(record => [
               record.clinician_name,
               record.clinician_phone,
               record.total_services,
               currencyFormatter.format(Number(record.earned_revenue)),
               currencyFormatter.format(Number(record.cash_collected)),
               currencyFormatter.format(Number(record.commission_earned_total)),
          ]),
          styles: { fontSize: 12, font: 'times', fontStyle: 'bold' },
          headStyles: { fillColor: [22, 160, 133], fontSize: 13, font: 'times', fontStyle: 'bold' },
          bodyStyles: { font: 'times', fontStyle: 'bold' },
     });

     doc.save(`clinician-commission-report-${startDate}-to-${endDate}.pdf`);
}
