export const resultTypes=[['numeric','Numeric'],['text','Short text'],['coded','Choice list'],['narrative','Narrative'],['time','Time'],['date','Date'],['datetime','Date & time'],['ultrasound','Ultrasound'],['fetalBiometry','Fetal biometry']] as const;
export function parameterDefinition(rule:any){
 const numeric=['limits','greaterLess','greaterLessEqualTo'].includes(rule.plan);
 return {result_type:rule.result_type || (numeric?'numeric':({options:'coded',plain:'narrative',ultrasoundFields:'ultrasound',fetalBiometry:'fetalBiometry',time:'time',date:'date',datetime:'datetime'} as any)[rule.plan]||(rule.plan?'text':'')),
 reference_mode:rule.reference_mode || (rule.plan==='limits'?(['lowerLimitMale','upperLimitMale','lowerLimitFemale','upperLimitFemale','lowerLimitChildren','upperLimitChildren','lowerLimitNeonates','upperLimitNeonates'].some(k=>rule[k]!==null&&rule[k]!==undefined&&rule[k]!=='')?'demographic':'interval'):rule.plan==='textReference'?'text':['greaterLess','greaterLessEqualTo'].includes(rule.plan)?'comparison':'none')};
}
export function referenceModes(type:string):[string,string][]{return type==='numeric'?[['none','No reference range'],['interval','Reference interval'],['demographic','Demographic intervals'],['comparison','Comparison threshold']]:type==='text'?[['none','No reference'],['text','Text reference']]:[['none','No reference']];}
export function withDefinition(rule:any,patch:any){
 const next={...parameterDefinition(rule),...patch};
 if(!referenceModes(next.result_type).some(([key])=>key===next.reference_mode))next.reference_mode='none';
 let plan=({numeric:'input',text:'input',coded:'options',narrative:'plain',ultrasound:'ultrasoundFields',fetalBiometry:'fetalBiometry',time:'time',date:'date',datetime:'datetime'} as any)[next.result_type]||'';
 if(next.result_type==='numeric'&&['interval','demographic'].includes(next.reference_mode))plan='limits';
 if(next.result_type==='numeric'&&next.reference_mode==='comparison')plan=/[<>]=/.test(rule.textReference||'')?'greaterLessEqualTo':'greaterLess';
 if(next.result_type==='text'&&next.reference_mode==='text')plan='textReference';
 return {...rule,...next,plan};
}
