import MainSettings from '../../components/settingsComponents/settings';
import SettingsSidebar from '../../components/settingsComponents/sidebars';
import Sidebar from '../../components/sidebar';


function Settings() {
	return (
		<>
			
		</>
	)
}

export default Settings;



Settings.getLayout = function PageLayout(page) {
	return (
		<>
			<div className='s-s-pliter'>
				<div className='sid'>
					<SettingsSidebar />
				</div>
				<div className='main'>
					{page}
				</div>
			</div>
		</>
	)
}