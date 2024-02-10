import { useState } from 'react';
import dynamic from 'next/dynamic'
import { Tabs, Tab } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
const ApplicationSettingsComponent = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/ApplicationSettings'));
const ApplicationResultSettings = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/ResultSettings'));
const ApplicationEmailPreference = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/EmailPreference'));


export default function Settings() {
	const [key, setKey] = useState("application#settings");
	return (
		<MainSettingsLayoutView>
			<h5 className='fw-bold'>Application settings</h5>
			<Tabs id='applicationsettings' onSelect={(k) => { setKey(k) }} activeKey={key} >
				<Tab eventKey="result#settings" title="Result settings">
					{key === 'result#settings' && <ApplicationResultSettings />}
				</Tab>
				<Tab eventKey="application#settings" title="Application settings">
					{key === 'application#settings' && <ApplicationSettingsComponent />}
				</Tab>
				<Tab eventKey='email' title='email preference'>
					{key === 'email' && <ApplicationEmailPreference />}
				</Tab>
				<Tab eventKey='sms settings' title='sms settings'>

				</Tab>
			</Tabs>
		</MainSettingsLayoutView>
	);
}
