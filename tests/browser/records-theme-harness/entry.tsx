import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "../../../components/ThemeProvider";
import BackupSecurityPage from "../../../app/settings/records/backup-security/page";
import BackupRestorePage from "../../../app/settings/records/data-backup-restore/page";
import ResultAccessRequestsPage from "../../../app/settings/records/result-access-requests/page";
import ResultAccessibleSettingsPage from "../../../app/settings/records/result-accessible-settings/page";
import ManualJournalPage from "../../../app/accounting/manual-journals/new/page";
import BackupProgressSection from "../../../components/settings/backup/BackupProgressSection";

const pages = {
     security: BackupSecurityPage,
     backup: BackupRestorePage,
     requests: ResultAccessRequestsPage,
     access: ResultAccessibleSettingsPage,
     journal: ManualJournalPage,
     progress: () => (
          <BackupProgressSection
               isBackupRunning
               backupProgress={50}
               backupStatus="Running"
               currentOperation="Creating synthetic backup"
               estimatedTime="1 minute"
               onCancelBackup={() => {}}
          />
     ),
};

function Fixture() {
     const { theme, toggleTheme } = useTheme();
     const page = new URLSearchParams(location.search).get("page");
     if (!page || !(page in pages)) throw new Error("Unknown synthetic fixture page");
     const Page = pages[page as keyof typeof pages];

     return (
          <>
               <button type="button" data-testid="theme-toggle" onClick={toggleTheme}>
                    Switch from {theme}
               </button>
               <main><Page /></main>
          </>
     );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing synthetic fixture root");
createRoot(root).render(<ThemeProvider><Fixture /></ThemeProvider>);
