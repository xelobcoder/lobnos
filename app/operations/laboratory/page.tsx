'use client'
import React from 'react'
import Link from 'next/link'
import { RiTestTubeLine, RiLoader4Line, RiCheckboxCircleLine, RiShieldCheckLine, RiFileListLine, RiAlarmWarningLine, RiTimeLine, RiArchiveLine } from '@remixicon/react'
import { useApplication } from '../../../components/Auth/useApplicationContext'

const LaboratoryOperationsLinks = [
    { title: "Laboratory Workbench", link: "/operations/laboratory/workbench", icon: <RiFileListLine /> },
    { title: "Quality Control", link: "/operations/laboratory/quality-control", icon: <RiShieldCheckLine /> },
    { title: "Pending Result Delivery", link: "/operations/laboratory/undelivered", icon: <RiFileListLine /> },
    { title: "Walk-in Queue & Client Tracking", link: "/operations/queue", icon: <RiTimeLine /> },
	{title: "Sample Collection",link: "/operations/phelobotomy/pending-samples-collection", icon: <RiTestTubeLine /> },
	{ title: "Sample Validation", link: `/operations/laboratory/sample/validation`, icon: <RiTestTubeLine /> },
	{ title: "Specimen Storage & Retention", link: "/operations/phelobotomy/specimen-storage", icon: <RiArchiveLine /> },
	{ title: "Processing stage", link: `/operations/laboratory/processing`, icon: <RiLoader4Line /> },
	{ title: "Completed stage", link: `/operations/laboratory/completed`, icon: <RiCheckboxCircleLine /> },
	{ title: "Validation stage", link: `/operations/laboratory/validation`, icon: <RiShieldCheckLine /> },
	{ title: "Validated Result", link: `/operations/laboratory/validated`, icon: <RiFileListLine /> },
	{ title: "Critical Values Alert", link: `/operations/laboratory/criticalvaluesAlert`, icon: <RiAlarmWarningLine /> },
	{ title: "Turn around Time", link: `/operations/laboratory/turnaroundtime`, icon: <RiTimeLine /> },
]

export default function Page() {
	const app = useApplication()?.settings;
	const isCompleteFlow = app?.completeFlow == 1 || app?.completeFlow == "1";
	const getIconStyle = (index: number) => {
		const colors = ['#E53935', '#1E88E5', '#8E24AA', '#43A047', '#FB8C00', '#00ACC1', '#5D4037']
		const color = colors[index % colors.length]
		return {
			color: color,
			background: `${color}15`,
			padding: '10px',
			borderRadius: '5px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '40px',
			height: '40px'
		}
	}

	const getDescription = (title: string) => {
		if (title.includes('Workbench')) return 'Assign and hand over work, monitor configured deadlines and QC, and record actual material usage.';
        if (title.includes('Quality Control')) return 'Record and review QC for the current branch and analyzer.';
        if (title.includes('Pending Result Delivery')) return 'Track finalized results awaiting delivery and investigate failed delivery attempts.';
		if (title.includes('Walk-in Queue')) {
			return 'Call waiting clients, link registration and billing, and track test progress. Open the public check-in link or facility display.'
		} else if (title.includes('Specimen Storage')) {
			return 'Store collected or received samples by freezer, rack and position. Manage aliquots, retrieval, retention and documented disposal.'
		} else if (title.includes('Sample Validation')) {
			return 'Verify and validate incoming laboratory samples. Ensure proper labeling, adequate volume, and appropriate container usage.'
		} else if (title.includes('Processing stage')) {
			return 'Track samples currently being processed in the laboratory. Monitor test progress and manage workload distribution.'
		} else if (title.includes('Completed stage')) {
			return 'View and manage tests that have completed the analytical phase but are pending validation and verification.'
		} else if (title.includes('Validation stage')) {
			return 'Perform quality checks on completed tests. Review results for accuracy and consistency before final approval.'
		} else if (title.includes('Validated Result')) {
			return 'Access and manage finalized laboratory results that have passed all validation checks and are ready for reporting.'
		} else if (title.includes('Critical Values')) {
			return 'Monitor and respond to critical test results that require immediate clinical attention. Set up notification protocols.'
		} else if (title.includes('Turn around Time')) {
			return 'Track and analyze laboratory performance metrics including test completion times and efficiency indicators.'
		} else {
			return 'Manage laboratory operations and workflows to ensure efficient and accurate test processing.'
		}
	}


	return (
		<div className="py-3">
			<div className="mb-4 pb-2 border-bottom">
				<h4 className="mb-2 fw-bold" style={{ color: '#1E88E5' }}>Laboratory Operations</h4>
				<p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
					Manage all aspects of laboratory workflow and testing procedures from sample collection to result validation
				</p>
			</div>
			<p className="text-muted mb-3">Manage all aspects of laboratory workflow and testing procedures</p>

			<div className="row g-3">
				{LaboratoryOperationsLinks.filter(link => isCompleteFlow || !['/operations/laboratory/sample/validation', '/operations/laboratory/processing'].includes(link.link)).map((link, index) => (
					<div key={index} className="col-12 col-md-6 col-lg-4">
						<Link
							href={link.link}
							className="text-decoration-none"
						>
							<div className="card h-100 border-0 shadow-sm" style={{
								borderRadius: '5px',
								boxShadow: `0 2px 4px rgba(0,0,0,0.1)`
							}}>
								<div className="card-body p-3">
									<div className="d-flex align-items-center mb-2">
										<div
											className="me-3"
											style={getIconStyle(index)}
										>
											{link.icon}
										</div>
										<h3 className="h6 mb-0">{link.title}</h3>
									</div>
									<p className="text-muted small mb-0">
										{getDescription(link.title)}
									</p>
								</div>
							</div>
						</Link>
					</div>
				))}
			</div>
		</div>
	)
}
