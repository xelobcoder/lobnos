
import styles from './CompanyHeaders.module.css';

interface CompanyHeadersProps {
	companyInfo: {
		email: string;
		phonenumber: number;
		address: string;
		name: string;
		alternativenumber?: string;
	} | null;
	logo: string
}

export default function CompanyHeaders({ companyInfo, logo }: CompanyHeadersProps) {
	if (!companyInfo) return null;

	const {
		name,
		email,
		phonenumber,
		address,
		alternativenumber
	} = companyInfo;



	return (
		<div className={styles['company-info-result']}>
			<div className="logo">
				<img
					src={logo || ''}
					width={150}
					height={100}
					alt="Company Logo"
				/>
			</div>
			<div className="other-information">
				<div className={styles['company-name']}>{name}</div>
				<div className={styles['company-kids']}>Location: {address}</div>
				<div className={styles['company-kids']}>Email: {email}</div>
				<div className={`${styles['company-kids']} text-capitalize`}>
					<span>
						Contact us: 0{phonenumber} || 0{alternativenumber}
					</span>
				</div>
			</div>
		</div>
	);
}
