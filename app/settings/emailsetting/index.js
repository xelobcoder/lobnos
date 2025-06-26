import { useCallback, useEffect, useState } from 'react';
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import { ToastContainer, toast } from 'react-toastify';
import ISLOADING from '../../../components/isLoading';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import CardRacks from '../../../components/accessories/CardRacks';

export default function ApplicationEmailSettings() {
	const [loading, setLoading] = useState(true);
	const defaultSettings = {
		provider: "",
		email: "",
		apppassword: "",
		verificationSubject: "",
		readySubject: "",
		sampleSubject: ""
	};
	const [settings, setSettings] = useState(defaultSettings);

	const updateSettings = async () => {
		if (Object.values(settings).includes('')) {
			toast.error('Please fill all the fields');
			return;
		}
		const pushRequest = await customPost('applicationssettings/email/emailsettings', 'PUT', settings);
		const { statusCode, status, message } = pushRequest;
		if (statusCode === 200 && status === 'success') {
			toast.success(message);
		} else if (statusCode === 400 && status === 'error') {
			toast.error(message);
		}
	};

	const getGeneralSettings = useCallback(async () => {
		try {
			const response = await customFetch('applicationssettings/email/emailsettings');
			const { statusCode, status, message, result } = response;
			if (statusCode === 200 && status === 'success' && result.length > 0) {
				setSettings(result[0]);
			}
			setLoading(false);
		} catch (err) {
			toast.error('Something went wrong', { autoClose: 5000 });
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getGeneralSettings();
	}, [getGeneralSettings]);

	return (
		<MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
			<ToastContainer />
			{loading && <ISLOADING />}
			{!loading && (
				<div className="my-2 mx-2">
					<CardRacks
						activestate={true}
						header={<h5>Update Email Settings</h5>}
						body={
							<form>
								<div className="my-2 mx-1 grid-reg">
									<label>Service Provider</label>
									<input
										type="text"
										className="custom-input"
										value={settings.provider}
										onChange={(ev) => setSettings({ ...settings, provider: ev.target.value })}
										required
										placeholder="e.g., gmail, github, yahoo, mailtrap"
									/>
								</div>
								<div className="my-2 mx-1 grid-reg">
									<label>Application Email</label>
									<input
										type="email"
										className="custom-input"
										value={settings.email}
										onChange={(ev) => setSettings({ ...settings, email: ev.target.value })}
										required
										placeholder="yourapp@example.com"
									/>
								</div>
								<div className="my-2 mx-1 grid-reg">
									<label>Application Password</label>
									<input
										type="password"
										className="custom-input"
										value={settings.apppassword}
										onChange={(ev) => setSettings({ ...settings, apppassword: ev.target.value })}
										required
										placeholder="your-email-app-password"
									/>
								</div>
								<div className="my-2 mx-1 grid-reg">
									<label>Email Verification Subject <span className="text-danger">(please keep it brief)</span></label>
									<textarea
										rows={2}
										className="form-control"
										value={settings.verificationSubject}
										onChange={(ev) => setSettings({ ...settings, verificationSubject: ev.target.value })}
										required
									/>
								</div>
								<div className="my-2 mx-1 grid-reg">
									<label>Result Ready and Approved Subject <span className="text-danger">(please keep it brief)</span></label>
									<textarea
										rows={2}
										className="form-control"
										value={settings.readySubject}
										onChange={(ev) => setSettings({ ...settings, readySubject: ev.target.value })}
										required
									/>
								</div>
								<div className="my-2 mx-1 grid-reg">
									<label>Sample Rejection Subject <span className="text-danger">(please keep it brief)</span></label>
									<textarea
										rows={2}
										className="form-control"
										value={settings.sampleSubject}
										onChange={(ev) => setSettings({ ...settings, sampleSubject: ev.target.value })}
										required
									/>
								</div>
								<div className="my-2 mx-1 grid-reg">
									<button type="button" onClick={updateSettings} className="btn btn-primary btn-sm">Update Information</button>
								</div>
							</form>
						}
					/>
				</div>
			)}
		</MainSettingsLayoutView>
	);
}
