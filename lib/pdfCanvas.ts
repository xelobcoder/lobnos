/** Empty optional report blocks produce `data:,`, which jsPDF cannot decode. */
export function reportCanvasPng(canvas: Pick<HTMLCanvasElement, 'width' | 'height' | 'toDataURL'>, widthMm: number) {
    if (canvas.width <= 0 || canvas.height <= 0) return null;
    const data = canvas.toDataURL('image/png');
    if (data === 'data:,') return null;
    if (!data.startsWith('data:image/png;base64,iVBORw0KGgo')) {
        throw new Error('The report capture did not produce a valid PNG image.');
    }
    return { data, heightMm: canvas.height * widthMm / canvas.width };
}
