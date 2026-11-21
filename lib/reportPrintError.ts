/** Normalizes both boolean and string API errors before any PDF or print controls render. */
export function reportPrintError(response:any):string {
 if(!response||response.status===false||response.success===false||response.status==='error'||response.status==='failed'||Number(response.statusCode)>=400)
  return String(response?.message||'The report could not be loaded. Please retry.');
 return '';
}
