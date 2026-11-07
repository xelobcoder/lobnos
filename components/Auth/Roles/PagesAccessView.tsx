import { Form } from "react-bootstrap"
import { LabPermissions } from '../../../types/permissions'

interface PagesAccessViewProps {
	data: LabPermissions;
	changeEvent: (permissions: LabPermissions) => void;
	target: LabPermissions;
	handler: (event: React.ChangeEvent<HTMLInputElement>, target: LabPermissions, changeEvent: (permissions: LabPermissions) => void) => void;
	pageAcesshandler: (event: React.ChangeEvent<HTMLInputElement>, target: LabPermissions, changeEvent: (permissions: LabPermissions) => void) => void;
	role: string;
}

export default function PagesAccessView({ data, changeEvent, target, handler, pageAcesshandler, role }: PagesAccessViewProps) {
	// Group permissions by resource with CRUD operations
	const permissionGroups = {
		"Test Panels": {
			group: 'testPanels',
			permissions: [
				{ key: 'view', label: 'View the laboratory test-panel list' },
				{ key: 'manage', label: 'Create and edit laboratory test panels and settings' }
			]
		},
		"Patients": {
			group: 'patients',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Samples": {
			group: 'samples',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Orders": {
			group: 'orders',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Results": {
			group: 'results',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Quality Control": {
			group: 'qualityControl',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Billing": {
			group: 'billing',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Inventory": {
			group: 'inventory',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Compliance": {
			group: 'compliance',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		},
		"Administration": {
			group: 'administration',
			permissions: [
				{ key: 'create', label: 'Create' },
				{ key: 'read', label: 'Read' },
				{ key: 'update', label: 'Update' },
				{ key: 'delete', label: 'Delete' }
			]
		}
	};

	const excludedFields = ["username", "role", "pageAccess", "pageaccess", "permissions"];

	return (
		<>
			{/* Functional Permissions */}
			{Object.entries(permissionGroups).map(([groupName, groupConfig]) => {
				const groupData = data[groupConfig.group as keyof LabPermissions] as any;
				return (
					<div key={groupName} className="row mx-2 mb-4">
						<h5>{groupName}</h5>
						<hr />
						<div className="row">
							{Array.isArray(groupConfig.permissions) && groupConfig.permissions.length > 0 && groupConfig.permissions.map(permission => {
								const groupData = data[groupConfig.group as keyof LabPermissions] as any;
								const permissionValue = groupData
									? groupData[permission.key] === true || (permission.key === 'view' && groupConfig.group === 'testPanels' && groupData.manage === true)
									: false;

								return (
									<div key={permission.key} className="col-12 border p-2 rounded mx-2  col-md-6 col-lg-4 mb-2">
										<div className="form-check">
											<input
												type="checkbox"
												name={`${groupConfig.group}.${permission.key}`}
												style={{ fontSize: '16px', marginRight: '8px' }}
												onChange={(ev) => handler(ev, target, changeEvent)}
												checked={permissionValue || false}
												className="form-check-input"
												id={`${groupConfig.group}.${permission.key}`}
											/>
											<label className="form-check-label" htmlFor={`${groupConfig.group}.${permission.key}`}>
												{permission.label}
											</label>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}

			{/* Page Access */}
			<div className="row mx-2">
				<h5>Page Access</h5>
				<hr />
				{data?.pageAccess &&
					Object.entries(data?.pageAccess).map((item, index) => {
						const [keys, value] = item
						return (
							<div className="col-12 col-md-6 col-lg-4 mb-2" key={index}>
								<div className="d-flex justify-content-between align-items-center p-2 border rounded">
									<h6 className="text-capitalize mb-0">{keys}</h6>
									<Form.Switch
										name={keys}
										onChange={(ev) => pageAcesshandler(ev, target, changeEvent)}
										checked={data.pageAccess[keys as keyof typeof data.pageAccess] || false}
										type="switch"
										style={{ fontSize: "20px" }}
									/>
								</div>
							</div>
						)
					})}
			</div>
		</>
	)
}
