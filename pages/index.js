import React from 'react';
import { useContext } from 'react';
import AuthContext from '../components/Auth/useAuthentification';
import FrontPageFrontdeskView from '../components/FrontPageView/frontdeskView';
import FrontPageAdminView from '../components/FrontPageView/adminView';
import FrontPageLabScientistView from '../components/FrontPageView/labScientistView';
import FrontPageSonographerView from '../components/FrontPageView/sonographerView';
import FrontPagePhelobotomyView from '../components/FrontPageView/phelobotomyView';
import Header from '../components/header';

export default function Index() {
  const { auth } = useContext(AuthContext);

  const { username, role } = auth;
  return (
    <>
      <Header/>
      <div id='frontpagewrapper'>
        <h2 className='d-flex justify-content-center text-capitalize'>Hi {username}!!!!</h2>
        <h2 className='d-flex justify-content-center text-capitalize'>{role}</h2>
        {role === 'customer service representative' && <FrontPageFrontdeskView />}
        {role === 'admin' && <FrontPageAdminView />}
        {role === 'scientist' && <FrontPageLabScientistView />}
        {role === 'sonographer' && <FrontPageSonographerView />}
        {role === 'phelobotomist' && <FrontPagePhelobotomyView />}
      </div>
    </>
  );
}
