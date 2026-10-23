export function nextFormulaToken(tokens: string[]): string {
 const used=new Set(tokens.map(token=>token.trim()));
 for(let index=0;index<32;index++){const token=index<26?String.fromCharCode(65+index):'V'+(index+1);if(!used.has(token))return token;}
 throw new Error('A formula supports at most 32 inputs.');
}
