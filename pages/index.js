import FrontPageFrontdeskView from '../components/FrontPageView/frontdeskView';
import FrontPageAdminView from '../components/FrontPageView/adminView';
import FrontPageLabScientistView from '../components/FrontPageView/labScientistView';
import FrontPageSonographerView from '../components/FrontPageView/sonographerView';
import FrontPagePhelobotomyView from '../components/FrontPageView/phelobotomyView';
import HeaderNav from "../components/Layout/HeaderNav";
import AuthContext, { useTheme } from '../components/Auth/useAuthentification';
import { useContext } from 'react';
export default function Index() {
  const { daysToExpiration } = useTheme();
  const { auth } = useContext(AuthContext);
  const role = auth?.role;

  return (
    <>
      <HeaderNav />
      {(daysToExpiration && daysToExpiration > 0) ? (
        <div id="frontpagewrapper" className="bg-white">
          {role === "customer service representative" && <FrontPageFrontdeskView />}
          {(role === "admin" || role == "manager") && <FrontPageAdminView />}
          {role === "scientist" && <FrontPageLabScientistView />}
          {role === "sonographer" && <FrontPageSonographerView />}
          {role === "phelobotomist" && <FrontPagePhelobotomyView />}
        </div>
      ) : (
        <div className='alert alert-danger my-2 mx-3 p-3'>
          <h1 >Product Licensed Expired.Contact Developer for updates</h1>
        </div>
      )}
    </>
  );
}
