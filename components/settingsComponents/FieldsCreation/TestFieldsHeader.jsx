import Link from "next/link";
import styles from './TestFieldsHeader.module.css';
import { 
    RiAlertLine,
    RiGitBranchLine,
   RiCornerDownRightFill
} from '@remixicon/react';

export default function TestFieldsHeader({ testid, testname }) {
    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>{testname}</h2>
                    <span className={styles.badge}>Test Configuration</span>
                </div>
                <div className={styles.headerLinks}>
                    <Link
                        href={`/settings/test/${testid}/alert-levels`}
                        className={styles.headerLink}
                    >
                        <RiAlertLine size={20} />
                        <span>Alert Levels</span>
                    </Link>
                    <Link
                        href={`/settings/applicationsettings/testpanels/fieldscategory/${testid}`}
                        className={styles.headerLink}
                    >
                        <RiGitBranchLine size={20} />
                        <span>Field Categories</span>
                    </Link>
                    <Link
                        href={`/settings/applicationsettings/testpanels/multiple-test-conditions/${testid}`}
                        className={styles.headerLink}
                    >
                        <RiCornerDownRightFill size={20} />
                        <span>Multiple Conditions</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}