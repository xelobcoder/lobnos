import React from 'react';
import { Table } from 'react-bootstrap';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'

export default function Settings() {
	return (
		<SettingsLayout>
			<div className='m-2'><h4 className='btn btn-danger text-white'>Application settings</h4></div>
			<div className='p-2'>
				<Table className='bg-white' striped bordered hover>
					<thead className='bg-dark text-white'>
						<tr>
							<th className='text-capitalize'>#</th>
							<th className='text-capitalize'>setting</th>
							<th className='text-capitalize'>status</th>
							<th className='text-capitalize'>action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>1</td>
							<td className='text-capitalize'>Bulk registration</td>
							<td>activated</td>
							<td>
								<button className='btn btn-sm btn-danger'>deactivate</button>
							</td>
						</tr>
						<tr>
							<td>2</td>
							<td className='text-capitalize'> font size</td>
							<td>13px</td>
							<td>
								<input step='1' type='number' className='form-control' />
							</td>
						</tr>
						<tr>
							<td>3</td>
							<td className='text-capitalize'>text color</td>
							<td>black</td>
							<td>
								<input type='color' />
							</td>
						</tr>
						<tr>
							<td>4</td>
							<td className='text-capitalize'>background color</td>
							<td>white</td>
							<td>
								<input type='color' />
							</td>
						</tr>
						{/* deactivate after 24 hrs */}
						<tr>
							<td>5</td>
							<td className='text-capitalize'>deactivate client after 24 hrs</td>
							<td>activated</td>
							<td>
								<button className='btn btn-sm btn-danger'>deactivate</button>
							</td>
						</tr>
						{/* clear all bills before new transaction */}
						<tr>
							<td>6</td>
							<td className='text-capitalize'>clear all bills before new transaction</td>
							<td>activated</td>
							<td>
								<button className='btn btn-sm btn-danger'>deactivate</button>
							</td>
						</tr>
						<tr>
							<td>7</td>
							<td className='text-capitalize'>
								complete laboratory flow
							</td>
							<td>
								activated
							</td>
							<td>
								<button className='btn btn-sm btn-danger'>
									deactivate
								</button>
							</td>
						</tr>
						<tr>
							<td>8</td>
							<td className='text-capitalize'>
								approval before result printing
							</td>
							<td>
								activated
							</td>
							<td>
								<button className='btn btn-sm btn-danger'>
									deactivate
								</button>
							</td>
						</tr>
					</tbody>
				</Table>
				<div>
					<button className='btn btn-primary'>
						update settings
					</button>
				</div>
			</div>
		</SettingsLayout>
	)
}
