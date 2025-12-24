
import styles from './CompanyHeaders.module.css';
import { ResultSettings } from './result-settings';

export interface CompanyHeadersProps {
	companyInfo: {
		email: string;
		phonenumber: number;
		address: string;
		name: string;
		alternativenumber?: string;
		motto?: string;
	} | null;
	logo: string,
	resultsettings?: ResultSettings | null;
}

export default function CompanyHeaders({ companyInfo, logo, resultsettings }: CompanyHeadersProps) {
	if (!companyInfo) return null;

	const {
		name,
		email,
		phonenumber,
		address,
		alternativenumber
	} = companyInfo;

	const companyNamefontSize = resultsettings?.companyInfo?.namefontsize || '25px';
	const companyNamefontColor = resultsettings?.companyInfo?.color || 'black';
	const companyNamefontFamily = resultsettings?.fontfamily || 'Times New Roman';
	return (
		<div className={styles['company-info-result']}>
			<div className="logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<img
					src={logo || `${process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL}/settings/companyprofile/images`}
					className={styles['company-logo']}
					alt="Company Logo"
					style={{ display: 'block', visibility: 'visible' }}
					width={100}
					height={70}
					crossOrigin="anonymous"
					onError={(e) => {
						console.warn('Logo failed to load, retrying...');
						const target = e.target as HTMLImageElement;
						setTimeout(() => {
							const temp = target.src;
							target.src = '';
							target.src = temp;
						}, 500);
					}}
				/>
			</div>
			<div className="other-information">
				<div style={{
					fontSize: `${companyNamefontSize} !important`,
					color: companyNamefontColor,
					fontWeight: 'bold',
					letterSpacing: '1.5px',
					textTransform: 'uppercase',
					fontFamily: companyNamefontFamily
				}} className={styles['company-name']}>{name}</div>
				<div className={styles['company-kids']}>Location: {address}</div>
				<div className={`${styles['company-kids']}`}>
					<span>
						Tel: 0{phonenumber} || {alternativenumber} {"  "}Email:{email}
					</span>
				</div>
			</div>
		</div>
	);
}
