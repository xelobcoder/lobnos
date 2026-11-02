import AccountingWorkspace from '../../components/AccountingWorkspace';
export default async function Page({ params }: { params: Promise<{id:string}> }) {
  const {id}=await params;
  return <AccountingWorkspace section="expenses" id={id}/>;
}
