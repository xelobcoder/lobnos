import React from 'react'
import PackagesTable from '../../../components/Billing/packages/PackagesList'
import Link from 'next/link'

export default function PackagesPages() {
	return (
		<div>
			<div>
				<Link href="/billing/packages/create-new-package" className="btn btn-primary btn-sm mb-3">
					Create New Package
				</Link>
			</div>
			<PackagesTable />
		</div>
	)
}
