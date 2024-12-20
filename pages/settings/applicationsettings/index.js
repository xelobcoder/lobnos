import { useState } from 'react';
import dynamic from 'next/dynamic'
import { Tabs, Tab } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
const ApplicationSettingsComponent = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/ApplicationSettings'));
const ApplicationResultSettings = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/ResultSettings'));
const ApplicationEmailPreference = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/EmailPreference'));
const SmsApplicationPreferenece = dynamic(() => import('../../../components/settingsComponents/ApplicationSettings/SmsPreferenceSettings'));

export default function Settings() {
	const [key, setKey] = useState("result#settings");
	return (
		<MainSettingsLayoutView>
			<h5 className='fw-bold mx-2 bg-secondary-subtle p-3 my-3'>Application settings</h5>
			<div className='mx-2'>
				<Tabs id='applicationsettings' onSelect={(k) => { setKey(k) }} activeKey={key} >
					<Tab eventKey="result#settings" title="Result settings">
						{key === 'result#settings' && <ApplicationResultSettings />}
					</Tab>
					<Tab eventKey="application#settings" title="Application settings">
						{key === 'application#settings' && <ApplicationSettingsComponent />}
					</Tab>
					<Tab eventKey='email' title='Email preference'>
						{key === 'email' && <ApplicationEmailPreference />}
					</Tab>
					<Tab eventKey='smssettings' title='SMS Settings'>
						{key === "smssettings" && <SmsApplicationPreferenece />}
					</Tab>
				</Tabs>
			</div>
		</MainSettingsLayoutView>
	);
}
