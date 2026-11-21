"use client";
export default function ReportPrintUnavailable({message}:{message:string}){
 return <main className="container py-5"><section className="border rounded bg-white p-4" aria-labelledby="print-unavailable-heading">
 <h1 id="print-unavailable-heading" className="h4">Report cannot be printed</h1>
 <p role="alert" className="alert alert-warning my-3">{message}</p>
 <p>Only signed and released results are available for printing. Ask an authorized laboratory staff member to complete Sign &amp; Release, then retry.</p>
 <button type="button" className="btn btn-primary" onClick={()=>window.location.reload()}>Retry</button>
 </section></main>;
}
