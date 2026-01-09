import { useState } from "react";
import Link from "next/link";
import {
    RiGitBranchLine,
    RiCornerDownRightFill
} from '@remixicon/react';

export default function TestFieldsHeader({ testid, testname }) {
    const [showQCModal, setShowQCModal] = useState(false);

    return (
        <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">
                <h2 className="fs-5 fw-bold text-dark mb-0">{testname}</h2>
                <span className="badge bg-secondary">Test Configuration</span>
            </div>
            <div className="d-flex align-items-center gap-2">
                <Link
                    href={`/settings/applicationsettings/testpanels/fieldscategory/${testid}`}
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                    <RiGitBranchLine size={16} />
                    <span>Field Categories</span>
                </Link>
                <Link
                    href={`/settings/applicationsettings/testpanels/multiple-test-conditions/${testid}`}
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                    <RiCornerDownRightFill size={16} />
                    <span>Multiple Conditions</span>
                </Link>
            </div>
        </div>
    );
}