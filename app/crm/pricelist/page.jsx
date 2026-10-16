"use client"
import { useEffect, useState } from "react"
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from '../../../components/accessories/Loader';
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { RiAddBoxFill, RiDownloadLine } from "@remixicon/react";
import { useRouter } from 'next/navigation'
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../components/Auth/roles";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PriceListCheck() {
     const [testlist, setTestList] = useState('');
     const [loading, setLoading] = useState(true);
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const userRole = applicationsettings?.user?.role?.toLowerCase();
     const canDownload = roleAllowed(userRole, ['admin', 'manager']);
     const checkoutLink = `/billing/patientid/checkout/multi?ispricingcheckout=1`

     useEffect(() => {
          customFetch('testpanel/list/bulk/billing')
               .then((response) => {
                    const { statusCode, status, data } = response;
                    if (Array.isArray(data) && data.length > 0) {
                         setTestList(data)
                    }
                    setLoading(false)
               }).catch((err) => {
                    setTestList([])
                    alert('something wrong occured');
                    setLoading(false);
               })

     }, [])

     const columns = [
          { Header: 'Test ID', accessor: "testid" },
          { Header: 'Name', accessor: 'name' },
          { Header: 'Price', accessor: 'discountedValue' }
     ]

     const handleDownloadPriceList = () => {
          const doc = new jsPDF({ unit: 'mm', format: 'a4' });
          const pageWidth  = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          const companyName  = (applicationsettings?.user?.company || applicationsettings?.company || 'Company').toUpperCase();
          const companyAddr  = applicationsettings?.companyAddress || applicationsettings?.tenantAddress || '';
          const companyEmail = applicationsettings?.companyEmail   || applicationsettings?.tenantEmail   || '';
          const companyPhone = applicationsettings?.companyContact || applicationsettings?.tenantContact || '';
          const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

          // ══ TOP ACCENT BAR ══
          doc.setFillColor(22, 34, 54);
          doc.rect(0, 0, pageWidth, 3, 'F');

          // ══ COMPANY NAME ══
          doc.setFont('candara', 'bold');
          doc.setFontSize(20);
          doc.setTextColor(22, 34, 54);
          doc.text(companyName, pageWidth / 2, 14, { align: 'center' });

          // ══ COMPANY CONTACT LINE ══
          const subParts = [];
          if (companyAddr)  subParts.push(companyAddr);
          if (companyPhone) subParts.push(`Tel: ${companyPhone}`);
          if (companyEmail) subParts.push(`Email: ${companyEmail}`);
          if (subParts.length > 0) {
               doc.setFont('candara', 'normal');
               doc.setFontSize(8.5);
               doc.setTextColor(100, 100, 100);
               doc.text(subParts.join('   \u2022   '), pageWidth / 2, 20, { align: 'center' });
          }

          // ══ DOUBLE RULE ══
          doc.setDrawColor(22, 34, 54);
          doc.setLineWidth(0.6);
          doc.line(14, 24, pageWidth - 14, 24);
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.2);
          doc.line(14, 25.5, pageWidth - 14, 25.5);

          // ══ DOCUMENT TITLE ══
          doc.setFont('candara', 'bold');
          doc.setFontSize(15);
          doc.setTextColor(22, 34, 54);
          doc.text('PRICE LIST', pageWidth / 2, 34, { align: 'center' });

          // ══ DATE ══
          doc.setFont('candara', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.text(`Effective Date: ${today}`, pageWidth / 2, 41, { align: 'center' });

          // Divider
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.2);
          doc.line(14, 45, pageWidth - 14, 45);

          // ══ ITEMS TABLE ══
          const data = Array.isArray(testlist) ? testlist : [];
          const tableBody = data.map((item, idx) => [
               String(idx + 1),
               item.testid || '',
               item.name || '',
               item.discountedValue !== undefined && item.discountedValue !== null
                    ? `GHS ${Number(item.discountedValue).toFixed(2)}`
                    : 'N/A'
          ]);

          autoTable(doc, {
               startY: 49,
               theme: 'grid',
               head: [['#', 'Test ID', 'Test / Service Name', 'Price (GHS)']],
               body: tableBody,
               foot: [[{ content: `Total Items: ${tableBody.length}`, colSpan: 4, styles: { halign: 'right' } }]],
               styles:     { font: 'candara', fontSize: 9, cellPadding: 3, textColor: [33, 37, 41] },
               headStyles: { fillColor: [22, 34, 54], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
               footStyles: { fillColor: [240, 240, 240], textColor: [22, 34, 54], fontStyle: 'bold' },
               alternateRowStyles: { fillColor: [248, 249, 250] },
               columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 22, halign: 'center' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 32, halign: 'right' },
               },
          });

          // ══ FOOTER ══
          doc.setDrawColor(22, 34, 54);
          doc.setLineWidth(0.4);
          doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

          doc.setFont('candara', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(140, 140, 140);
          doc.text(
               `This price list is generated by ${companyName} and is valid as of ${today}.`,
               pageWidth / 2, pageHeight - 13, { align: 'center' }
          );
          doc.text(
               'Prices are subject to change without prior notice.',
               pageWidth / 2, pageHeight - 8, { align: 'center' }
          );

          // Bottom accent bar
          doc.setFillColor(22, 34, 54);
          doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

          doc.save(`PriceList_${companyName.replace(/\s+/g, '_')}_${today.replace(/\s/g, '_')}.pdf`);
     };

     if (loading) return <Loader />
     return (
          <div>
               <div className="d-flex justify-content-end gap-2 mb-2">
                    {canDownload && (
                         <button
                              onClick={handleDownloadPriceList}
                              className="btn btn-outline-secondary"
                         >
                              <RiDownloadLine size={16} className="me-1" />
                              Download Price List (PDF)
                         </button>
                    )}
                    <button onClick={(ev) => { router.push(checkoutLink) }} className="btn btn-primary">
                         <RiAddBoxFill />   checkout pricing
                    </button>
               </div>
               <PrimeTable
                    filtering={true}
                    handleSeverSideProcessing={null}
                    serverSideFiltering={false}
                    column={columns}
                    data={testlist}
               />
          </div>
     )
}