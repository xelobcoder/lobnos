import { useContext, useEffect } from 'react';
import PhelobotomyLayout from '../../components/Layout/PhelobotomyLayout';
import AuthContext from '../../components/Auth/useAuthentification';

export default function PhelobotomyAnalyticPage() {
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (auth?.branchid && auth?.employeeid) {
      console.log('XY Installed')
    }
  }, [auth])

  return (
    <PhelobotomyLayout>
      <section className='mx-2'>
        <h4>Analytics for {auth?.username}</h4>
      </section>
    </PhelobotomyLayout>
  )
}