
import styles from './CompanyHeaders.module.css';
import { ResultSettings } from './result-settings';

interface CompanyHeadersProps {
	companyInfo: {
		email: string;
		phonenumber: number;
		address: string;
		name: string;
		alternativenumber?: string;
	} | null;
	logo: string,
	resultsettings?: ResultSettings
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

	const companyNamefontSize = resultsettings?.companyInfo?.namefontsize || '20px';
	const companyNamefontColor = resultsettings?.companyInfo?.color || 'black';
	const companyNamefontFamily = resultsettings?.fontfamily || 'Times New Roman';
	return (
		<div className={styles['company-info-result']}>
			<div className="logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<img
					src={logo || ''}
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
					fontSize: companyNamefontSize,
					color: companyNamefontColor,
					fontWeight: 'bold',
					textTransform: 'uppercase',
					fontFamily: companyNamefontFamily
				}} className={styles['company-name']}>{name}</div>
				<div className={styles['company-kids']}>Location: {address}</div>
				<div className={`${styles['company-kids']} text-capitalize`}>
					<span>
						Tel: 0{phonenumber} || 0{alternativenumber},Email:{email}
					</span>
				</div>
			</div>
		</div>
	);
}
