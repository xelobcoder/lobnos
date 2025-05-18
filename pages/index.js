import { useApplicationSettings } from "../components/Auth/useApplicationContext";
import PrimeLayout from "../components/Layout/PrimeLayout";
import FrontPageAdminView from "../components/FrontPageView/adminView";
import FrontPageFrontdeskView from "../components/FrontPageView/frontdeskView";
import FrontPageLabScientistView from "../components/FrontPageView/labScientistView";
import FrontPagePhelobotomyView from "../components/FrontPageView/phelobotomyView";
import FrontPageSonographerView from "../components/FrontPageView/sonographerView";
import styles from "./index.module.css";

export default function Index() {
  const { applicationsettings } = useApplicationSettings();
  const { user, daysToExpiration } = applicationsettings;

  const roleViews = {
    "customer service representative": FrontPageFrontdeskView,
    admin: FrontPageAdminView,
    manager: FrontPageAdminView,
    scientist: FrontPageLabScientistView,
    sonographer: FrontPageSonographerView,
    phelobotomist: FrontPagePhelobotomyView,
  };

  const RoleComponent = roleViews[user.role];

  if (!daysToExpiration || daysToExpiration <= 0) {
    return (
      <div className={styles.expiredContainer}>
        <div className={styles.expiredContent}>
          <h1 className={styles.expiredTitle}>License Expired</h1>
          <p className={styles.expiredText}>
            Your product license has expired. Please contact our support team
            for renewal.
          </p>
          <button
            className={styles.contactButton}
            onClick={() =>
              (window.location.href = "mailto:support@example.com")
            }
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  if (!RoleComponent) {
    return (
      <PrimeLayout>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Access Denied</h2>
          <p className={styles.errorText}>
            You don&apos;t have permission to access this page. Please contact your
            administrator.
          </p>
        </div>
      </PrimeLayout>
    );
  }

  return (
   <PrimeLayout>
     <div className={styles.pageContainer}>
      <RoleComponent />
    </div>
    </PrimeLayout>
  );
}
