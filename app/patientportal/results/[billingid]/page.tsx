"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { RiArrowLeftLine, RiDownloadLine, RiPrinterLine } from '@remixicon/react';
import styles from '../../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../../components/PatientPortal/usePortalResource';
import LaboratoryReport, { LaboratoryReportData } from '../../../../components/ResultView/LaboratoryReport';
import { createLaboratoryReportPdf, laboratoryReportFilename } from '../../../../lib/laboratoryReportPdf';
import { errorMessage } from '../../../../lib/patientPortal';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import ResultQuickView from '../../../../components/PatientPortal/ResultQuickView';

interface ResultReport { billingid: number; reports: LaboratoryReportData[] }

const PRINT_ONLY_REPORT = `
@media print {
     @page { size: A4 portrait; margin: 5mm; }
     body * { visibility: hidden !important; }
     #pls-portal-report, #pls-portal-report * { visibility: visible !important; }
     #pls-portal-report { position: absolute; left: 0; top: 0; width: 100%; }
     #pls-portal-report [data-laboratory-report] { break-before: page; width: 100%; margin: 0; }
     #pls-portal-report [data-laboratory-report]:first-child { break-before: auto; }
     #pls-portal-report thead { display: table-header-group; }
     #pls-portal-report tr { break-inside: avoid; }
}`;

export default function PatientResultReportPage() {
    const params = useParams<{ billingid: string }>();
    const billingid = Number(params?.billingid);
    const valid = Number.isSafeInteger(billingid) && billingid > 0;
    const { data, loading, error, reload } = usePortalResource<ResultReport>(valid ? `patient-portal/results/${billingid}/report` : null);
    const app = useApplication();
    const reportRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const [pdf, setPdf] = useState<string | null>(null);
    useEffect(() => { setPdf(null); setExportError(''); }, [billingid, data]);
    useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf); }, [pdf]);
    const exportPdf = async () => {
        if (exporting || !reportRef.current) return;
        setExporting(true);
        setExportError('');
        try {
            const elements = Array.from(reportRef.current.querySelectorAll<HTMLElement>('.result'));
            const blob = await createLaboratoryReportPdf(elements);
            setPdf(URL.createObjectURL(blob));
        } catch (reason) {
            setExportError(errorMessage(reason));
        } finally { setExporting(false); }
    };
    return (
        <main className={styles.page}>
            <style>{PRINT_ONLY_REPORT}</style>
            <div className={`${styles.header} ${styles.noPrint}`}>
                <div><Link href="/patientportal/results" className="d-inline-flex align-items-center gap-1"><RiArrowLeftLine size={16} />Back to results</Link>
                    <h1 className="mt-2">Your laboratory report</h1><p className={styles.subtitle}>The same report format used by your facility, containing only your released results.</p></div>
                {!!data?.reports?.length && <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-primary" disabled={exporting} onClick={() => window.print()}><RiPrinterLine size={16} className="me-1" />Print report</Button>
                    <Button disabled={exporting} onClick={exportPdf}><RiDownloadLine size={16} className="me-1" />{exporting ? 'Preparing PDF...' : 'Generate PDF'}</Button>
                </div>}
            </div>
            {!valid && <Alert variant="danger">This report link is not valid.</Alert>}
            {error && <Alert variant="danger" className={styles.noPrint}>{error} <Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
            {exportError && <Alert variant="danger" className={styles.noPrint}>{exportError}</Alert>}
            {loading && <div className={styles.empty}><Spinner as="span" animation="border" size="sm" className="me-2" />Loading report...</div>}
            {data && !data.reports?.length && <Alert variant="warning">No printable report is available. Please contact your facility.</Alert>}
            {!!data?.reports?.length && <div className={styles.noPrint}><ResultQuickView reports={data.reports} /></div>}
            {pdf && <section className={`${styles.card} ${styles.noPrint}`} aria-label="Generated laboratory PDF">
                <a href={pdf} download={laboratoryReportFilename(billingid)} className="btn btn-primary mb-2">Download PDF</a>
                <iframe src={pdf} title="Laboratory report PDF" className={styles.pdfPreview} />
            </section>}
            <div id="pls-portal-report" ref={reportRef} className={styles.reportPreview}>
                {data?.reports?.map(report => <LaboratoryReport key={report.ascensionid} data={report}
                    billingPrefix={app?.settings?.billingidPrefix || ''} showWatermark={app?.settings?.show_watermark === 1} />)}
            </div>
        </main>
    );
}
