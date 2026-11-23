import {TestPanelWorkspace} from '../../../components/settingsComponents/TestPanelWorkspace';
import { redirect } from 'next/navigation';
import { requestBackendJson } from '../../../components/serverActions/backendRequest';
import { ApplicationProvider } from '../../../components/Auth/useApplicationContext';
import MasterWorkspace from '../MasterWorkspace';
import LaboratoryTestPanelLayout from '../../operations/laboratory/test-panels/layout';
import Link from 'next/link';
export default async function Layout({children}:{children:React.ReactNode}) {
 const access=await requestBackendJson('platform/facilities/access');
 if(access?.statusCode===401||access?.statusCode===403)redirect('/master-platform/login');
 if(access?.result?.authorized!==true)return <p role="alert">Master access could not be verified. Refresh to retry.</p>;
 return <ApplicationProvider initialSettings={{tenantId:2147483646,branchid:1,user:{employeeid:1,role:'super-admin',branch:1,tenantId:2147483646},settings:{}}}><MasterWorkspace><div className="alert alert-info mb-3">Master catalogue — changes here update the source catalogue for facility imports.</div><nav className="d-flex gap-2 mb-3" aria-label="Master catalog"><Link className="btn btn-outline-primary btn-sm" href="/master-platform/test-catalog/testlist">Test panels</Link><Link className="btn btn-outline-primary btn-sm" href="/master-platform/test-catalog/references">Departments, samples and containers</Link></nav><TestPanelWorkspace basePath="/master-platform/test-catalog"><LaboratoryTestPanelLayout>{children}</LaboratoryTestPanelLayout></TestPanelWorkspace></MasterWorkspace></ApplicationProvider>;
}
