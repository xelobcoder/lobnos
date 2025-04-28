import { useState } from "react";
import Link from "next/link";
import styles from './TestFieldsHeader.module.css';
import {
    RiAlertLine,
    RiGitBranchLine,
    RiCornerDownRightFill,
    RiShieldCheckLine
} from '@remixicon/react';
import QualityControlModal from './QualityControlModal';

export default function TestFieldsHeader({ testid, testname }) {
    const [showQCModal, setShowQCModal] = useState(false);

    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>{testname}</h2>
                    <span className={styles.badge}>Test Configuration</span>
                </div>
                <div className={styles.headerLinks}>
                    <button 
                        onClick={() => setShowQCModal(true)}
                        className={styles.headerLink}
                    >
                        <RiShieldCheckLine size={20} />
                        <span>Quality Control</span>
                    </button>
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

            <QualityControlModal 
                show={showQCModal}
                onHide={() => setShowQCModal(false)}
                testId={testid}
                testName={testname}
            />
        </div>
    );
}