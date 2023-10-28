import React from 'react';
import { useContext } from 'react';
import AuthContext from '../components/Auth/useAuthentification';
import FrontPageFrontdeskView from '../components/FrontPageView/frontdeskView';
import FrontPageAdminView from '../components/FrontPageView/adminView';
import FrontPageLabScientistView from '../components/FrontPageView/labScientistView';
import FrontPageSonographerView from '../components/FrontPageView/sonographerView';
import FrontPagePhelobotomyView from '../components/FrontPageView/phelobotomyView';

export default function Index() {
  const { auth } = useContext(AuthContext);

  const { username, role } = auth;
  return (
    <div id='frontpagewrapper'>
      <h2 className='d-flex justify-content-center text-uppercase text-bold'>{username}</h2>
      <h2 className='d-flex justify-content-center text-uppercase text-bold'>{role}</h2>
      {role === 'customer service representative' && <FrontPageFrontdeskView />}
      {role === 'admin' && <FrontPageAdminView />}
      {role === 'scientist' && <FrontPageLabScientistView />}
      {role === 'sonographer' && <FrontPageSonographerView />}
      {role === 'phelobotomist' && <FrontPagePhelobotomyView/>}
    </div>
  );
}
