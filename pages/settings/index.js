import { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';
import ApplicationSettingsComponent from '../../components/settingsComponents/ApplicationSettings/ApplicationSettings';


export default function Settings() {
	const [key, setKey] = useState("application#settings");

	return (
		<MainSettingsLayoutView>
			<h5 className='fw-bold'>Application settings</h5>
			<Tabs id='applicationsettings' onSelect={(k) => setKey(k)} activeKey={key} >
				<Tab eventKey="result#settings" title="Result settings">
					hwdfjhsdksd
				</Tab>
				<Tab eventKey="application#settings" title="Application settings">
					<ApplicationSettingsComponent />
				</Tab>
				<Tab eventKey="branches" title="default branch">

				</Tab>
				<Tab eventKey="branches" title="branches">

				</Tab>
			</Tabs>
		</MainSettingsLayoutView>
	);
}
