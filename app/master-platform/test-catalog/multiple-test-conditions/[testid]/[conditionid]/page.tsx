import SharedPage from '../../../../../settings/applicationsettings/testpanels/multiple-test-conditions/[testid]/[conditionid]/page';
export default function Page(props: {params:Promise<{testid:number,conditionid:number}>}){return <SharedPage {...props} masterCatalog />;}
