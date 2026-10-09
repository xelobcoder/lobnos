import styles from './CompanyHeadersDONDEE.module.css';
import { ResultSettings } from './result-settings';
import { scopedCompanyImageUrl } from '../../lib/companyImage';

export interface CompanyHeadersDONDEEProps {
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
     subsequent?: boolean;
}

export default function CompanyHeadersDONDEE({ companyInfo, logo, resultsettings, subsequent }: CompanyHeadersDONDEEProps) {
     if (!companyInfo) return null;

     const {
          name,
          email,
          phonenumber,
          address,
          alternativenumber,
          motto
     } = companyInfo;

     const companyNamefontSize = (resultsettings?.companyInfo?.namefontsize ? resultsettings.companyInfo.namefontsize + 'px' : '25px');
     const companyNamefontColor = resultsettings?.companyInfo?.color || 'black';
     const companyNamefontFamily = resultsettings?.companyInfo?.fontFamily || resultsettings?.fontfamily || 'Arial Black';


     return (
          <div className={`${styles['dondee-header']} ${subsequent ? styles.subsequent : ''}`}>
               <div className={styles['header-row']}>
                    {/* Logo on the left */}
                    <div  >
                         {scopedCompanyImageUrl(logo) && <img
                              src={scopedCompanyImageUrl(logo)}
                              className={styles['company-logo']}
                              alt="Company Logo"
                              style={{ display: 'block', visibility: 'visible' }}
                              width={120}
                              height={100}
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
                         />}
                    </div>
                    <div
                         className={styles['company-name-dondee']}
                         style={{
                              fontSize: companyNamefontSize,
                              color: companyNamefontColor,
                              fontFamily: companyNamefontFamily,
                         }}>
                         {name}
                    </div>

                    {/* Contact information on the right */}
                    <div className={styles['address-section']}>
                         <div className={styles['contact-info']}>
                              <div className={styles['contact-item']}>
                                   <span className={styles['contact-label']}></span>
                                   <span className={`${styles['contact-value']} fw-bold text-start`}>{address}</span>
                              </div>
                              <div className={styles['contact-item']}>
                                   <span className={styles['contact-label']}>Tel:</span>
                                   <span className={styles['contact-value']}>
                                        0{phonenumber}
                                        {alternativenumber && <span className={styles['alt-phone']}> | {alternativenumber}</span>}
                                   </span>
                              </div>
                              <div className={styles['contact-item']}>
                                   <span className={styles['contact-label']}>Email:</span>
                                   <span className={styles['contact-value']}>{email}</span>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}