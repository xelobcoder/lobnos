import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function reportPageCuts(height: number, capacity: number, boundaries: number[]): number[] {
    if (height <= 0 || capacity <= 0) throw new Error('Invalid report page dimensions');
    const cuts = [0];
    while (cuts[cuts.length - 1] < height) {
        const start = cuts[cuts.length - 1];
        const limit = Math.min(height, start + capacity);
        const candidates = boundaries.filter(y => y > start + capacity / 2 && y <= limit);
        cuts.push(limit === height || !candidates.length ? limit : Math.max(...candidates));
    }
    return cuts;
}

export function laboratoryReportFilename(billingid: number, ascensionid?: number): string {
    return `Laboratory-report-${billingid}${ascensionid ? `-${ascensionid}` : ''}.pdf`;
}

/** Shared A4 export for the staff report and the patient release-gated report. */
export async function createLaboratoryReportPdf(elements: HTMLElement[]): Promise<Blob> {
    if (!elements.length) throw new Error('No released report is available to export.');
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const pdf = new jsPDF('p', 'mm', 'a4', true);
    let page = 0;
    for (const element of elements) {
        await Promise.all(Array.from(element.querySelectorAll('img')).map(async image => {
            if (!image.complete) await new Promise<void>((resolve, reject) => {
                const timeout = window.setTimeout(() => reject(new Error('The laboratory logo took too long to load. Please retry.')), 15000);
                image.addEventListener('load', () => { clearTimeout(timeout); resolve(); }, { once: true });
                image.addEventListener('error', () => { clearTimeout(timeout); reject(new Error('The laboratory logo could not be loaded. Please retry.')); }, { once: true });
            });
            if (!image.naturalWidth) throw new Error('The laboratory logo could not be loaded. Please retry.');
        }));
        const canvas = await html2canvas(element, {
            scale: 2, useCORS: true, logging: false, imageTimeout: 15000,
            backgroundColor: '#ffffff',
            onclone: cloned => {
                cloned.querySelectorAll<HTMLElement>('.pdf-hide-footer').forEach(footer => { footer.style.display = 'none'; });
            },
        });
        const top = element.getBoundingClientRect().top;
        const scale = canvas.width / element.getBoundingClientRect().width;
        const boundaries = Array.from(element.querySelectorAll('tr, p, h5, .report-container')).map(node =>
            Math.floor((node.getBoundingClientRect().top - top) * scale));
        const contentWidth = 190;
        const contentHeight = 267;
        const capacity = Math.floor(contentHeight * canvas.width / contentWidth);
        const tables = Array.from(element.querySelectorAll('table')).map(table => {
            const header = table.querySelector('thead')?.getBoundingClientRect();
            const bounds = table.getBoundingClientRect();
            return header ? {
                start: Math.floor((bounds.top - top) * scale), end: Math.floor((bounds.bottom - top) * scale),
                headerStart: Math.floor((header.top - top) * scale), headerHeight: Math.ceil(header.height * scale),
            } : null;
        }).filter(table => table !== null);
        let start = 0;
        while (start < canvas.height) {
            if (page++) pdf.addPage();
            const table = tables.find(item => start > item.headerStart + item.headerHeight && start < item.end);
            const headerHeight = table ? Math.min(table.headerHeight, Math.floor(capacity / 4)) : 0;
            const end = start + reportPageCuts(canvas.height - start, capacity - headerHeight, boundaries.map(y => y - start))[1];
            const slice = document.createElement('canvas');
            slice.width = canvas.width;
            slice.height = end - start + headerHeight;
            const context = slice.getContext('2d');
            if (!context) throw new Error('Your browser could not create the report PDF.');
            if (table && headerHeight) context.drawImage(canvas, 0, table.headerStart, canvas.width, headerHeight, 0, 0, canvas.width, headerHeight);
            context.drawImage(canvas, 0, start, canvas.width, end - start, 0, headerHeight, canvas.width, end - start);
            pdf.addImage(slice.toDataURL('image/png'), 'PNG', 10, 10, contentWidth, slice.height * contentWidth / canvas.width);
            pdf.setFontSize(10);
            pdf.setTextColor(60, 60, 60);
            pdf.text(String(page), 105, 285, { align: 'center' });
            pdf.setFontSize(8);
            pdf.text('Prime Laboratory Software', 105, 290, { align: 'center' });
            start = end;
        }
    }
    return pdf.output('blob');
}
