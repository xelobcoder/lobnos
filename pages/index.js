import FrontPageFrontdeskView from '../components/FrontPageView/frontdeskView';
import FrontPageAdminView from '../components/FrontPageView/adminView';
import FrontPageLabScientistView from '../components/FrontPageView/labScientistView';
import FrontPageSonographerView from '../components/FrontPageView/sonographerView';
import FrontPagePhelobotomyView from '../components/FrontPageView/phelobotomyView';
import HeaderNav from "../components/Layout/HeaderNav";
import { Container } from 'react-bootstrap';
import { useApplicationSettings } from '../components/Auth/useApplicationContext';
export default function Index() {
  const { applicationsettings } = useApplicationSettings();
  const { user, daysToExpiration } = applicationsettings;
  const role = user.role;

  return (
    <>
      <HeaderNav />
      {(daysToExpiration && daysToExpiration > 0) ? (
        <div id="frontpagewrapper" className="bg-secondary-subtle" style={{ height: '90vh' }}>
          <Container>
            {role === "customer service representative" && <FrontPageFrontdeskView />}
            {(role === "admin" || role == "manager") && <FrontPageAdminView />}
            {role === "scientist" && <FrontPageLabScientistView />}
            {role === "sonographer" && <FrontPageSonographerView />}
            {role === "phelobotomist" && <FrontPagePhelobotomyView />}
          </Container>
        </div>
      ) : (
        <div className='alert alert-danger my-2 mx-3 p-3'>
          <h1 >Product Licensed Expired.Contact Developer for updates</h1>
        </div>
      )}
    </>
  );
}
