import styles from './CompanyHeadersFULLWIDTH.module.css';
import { ResultSettings } from './result-settings';
import { scopedCompanyImageUrl } from '../../lib/companyImage';

export interface CompanyHeadersFULLWIDTHProps {
     companyInfo: {
          email: string;
          phonenumber: number;
          address: string;
          street?: string;
          name: string;
          alternativenumber?: string;
          additionalInfo?: string;
     } | null;
     logo: string,
     resultsettings?: ResultSettings | null;
     subsequent?: boolean;
}

export default function CompanyHeadersFULLWIDTH({ companyInfo, logo, resultsettings, subsequent }: CompanyHeadersFULLWIDTHProps) {
     if (!companyInfo) return null;

     const {
          name,
          email,
          phonenumber,
          address,
          street,
          alternativenumber,
          additionalInfo
     } = companyInfo;

     const companyNamefontSize = resultsettings?.companyInfo?.namefontsize + 'px' || '25px';
     const companyNamefontColor = resultsettings?.companyInfo?.color || 'black';
     const companyNamefontFamily = resultsettings?.companyInfo?.fontFamily || resultsettings?.fontfamily || 'Arial Black';



     return (
          <div className={`${styles['company-info-fullwidth']} ${subsequent ? styles.subsequent : ''}`}>
               <div className="company-header-content">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                         {scopedCompanyImageUrl(logo) && (
                              <div style={{ width: '25%', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                   <img
                                        src={scopedCompanyImageUrl(logo)}
                                        alt="Company Logo"
                                        style={{
                                             maxWidth: '100%',
                                             maxHeight: '80px',
                                             objectFit: 'contain'
                                        }}
                                   />
                              </div>
                         )}
                         <div style={{
                              flex: 1,
                              fontSize: companyNamefontSize || "31px",
                              color: companyNamefontColor,
                              fontFamily: companyNamefontFamily,
                              fontWeight: '900',
                              letterSpacing: '3px',
                              textTransform: 'uppercase',
                              wordBreak: 'keep-all',
                              whiteSpace: 'nowrap',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                              textAlign: 'center',
                              padding: '0 0px',
                              lineHeight: '1.2'
                         }} className={styles['company-name-fullwidth']}>{name}</div>
                    </div>

                    <div className={styles['red-line']} style={{
                         width: '100% !important',
                         height: '0px',
                         borderTop: '4px solid #E74C3C',
                         marginTop: '0px',
                         marginBottom: '8px',
                    }}></div>

                    {additionalInfo && (
                         <div style={{
                              fontSize: '14px',
                              color: 'black',
                              fontFamily: companyNamefontFamily,
                              fontWeight: '700',
                              marginBottom: '4px',
                              letterSpacing: '0.5px',
                         }} className={styles['company-additional-info']}>{additionalInfo}</div>
                    )}

                    <div style={{
                         fontSize: '14px',
                         color: 'black',
                         fontWeight: '700',
                         fontFamily: companyNamefontFamily,
                         marginBottom: '2px',
                    }} className={styles['company-address-fullwidth']}>{address}</div>
                    {street && <div className={styles['company-address-fullwidth']}>{street}</div>}

                    <div style={{
                         fontSize: '13px',
                         color: '#333',
                         fontFamily: companyNamefontFamily,
                         fontWeight: '600',
                         marginTop: '4px',
                    }}>
                         <span style={{ fontWeight: '700' }}>Tel:</span> {phonenumber}
                         {alternativenumber && <span> • {alternativenumber}</span>}
                         {email && <span> • <span style={{ fontWeight: '700' }}>Email:</span> {email}</span>}
                    </div>
               </div>
          </div>
     );
}