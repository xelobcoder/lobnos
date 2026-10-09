
import styles from './CompanyHeaders.module.css';
import { ResultSettings } from './result-settings';
import { scopedCompanyImageUrl } from '../../lib/companyImage';

export interface CompanyHeadersProps {
	companyInfo: {
		email: string;
		phonenumber: number;
		address: string;
		name: string;
		alternativenumber?: string;
		motto?: string;
		website?: string;
		additionalInfo?: string;
	} | null;
	logo: string,
	resultsettings?: ResultSettings | null;
	subsequent?: boolean;
}

export default function CompanyHeaders({ companyInfo, logo, resultsettings, subsequent }: CompanyHeadersProps) {
	if (!companyInfo) return null;

	const {
		name,
		email,
		phonenumber,
		address,
		alternativenumber,
		additionalInfo
	} = companyInfo;

	const companyNamefontSize = resultsettings?.companyInfo?.namefontsize + 'px' || '25px';
	const companyNamefontColor = resultsettings?.companyInfo?.color || 'black';
	const companyNamefontFamily = resultsettings?.companyInfo?.fontFamily || resultsettings?.fontfamily || 'Arial Black';
	return (
		<div className={`${styles['company-info-result']} ${subsequent ? styles.subsequent : ''}`}>
			<div className="logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{scopedCompanyImageUrl(logo) && <img
					src={scopedCompanyImageUrl(logo)}
					className={styles['company-logo']}
					alt="Company Logo"
					style={{ display: 'block', visibility: 'visible' }}
					width={100}
					height={70}
					crossOrigin="anonymous"
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.style.visibility = 'hidden';
					}}
				/>}
			</div>
			<div className="other-information">
				<div style={{
					fontSize: companyNamefontSize || '50px',
					color: companyNamefontColor,
					fontWeight: 'bold',
					letterSpacing: '1.5px',
					textTransform: 'uppercase',
					fontFamily: companyNamefontFamily
				}} className={styles['company-name']}>{name}</div>
				<div className={styles['company-address']}>{additionalInfo}</div>
				<div className={styles['company-address']}>{address}</div>
				<div className={`${styles['company-address']}`}>
					<span>
						Tel: 0{phonenumber} || {alternativenumber} {"  "}Email:{email}
					</span>
				</div>
			</div>
		</div>
	);
}
