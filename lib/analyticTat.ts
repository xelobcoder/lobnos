export function formatAnalyticTat(value:unknown):string{
 if(value===null||value===undefined||value==='')return 'Not recorded';const n=Number(value);if(!Number.isFinite(n)||n<0)return 'Not recorded';const minutes=Math.round(n);return `${Math.floor(minutes/1440)}d ${Math.floor(minutes%1440/60)}h ${minutes%60}min`;
}
