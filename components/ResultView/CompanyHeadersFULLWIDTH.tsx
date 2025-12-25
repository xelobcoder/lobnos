import styles from './CompanyHeadersFULLWIDTH.module.css';
import { ResultSettings } from './result-settings';

export interface CompanyHeadersFULLWIDTHProps {
     companyInfo: {
          email: string;
          phonenumber: number;
          address: string;
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
          alternativenumber,
          additionalInfo
     } = companyInfo;

     const companyNamefontSize = resultsettings?.companyInfo?.namefontsize + 'px' || '25px';
     const companyNamefontColor = resultsettings?.companyInfo?.color || 'black';
     const companyNamefontFamily = resultsettings?.fontfamily || 'Arial Black';


     console.log('Rendering FULLWIDTH header with company info:', companyInfo);

     return (
          <div className={`${styles['company-info-fullwidth']} ${subsequent ? styles.subsequent : ''}`}>
               <div className="company-header-content" >
                    <div style={{
                         fontSize: "45px",
                         color: '#4A90E2',
                         fontWeight: '900',
                         letterSpacing: '2px',
                         textTransform: 'uppercase',
                         wordBreak: 'keep-all',
                         whiteSpace: 'nowrap',
                         fontFamily: 'Arial, Helvetica, sans-serif',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    }} className={styles['company-name-fullwidth']}>{name}</div>

                    <div style={{
                         width: '100%',
                         height: '4px',
                         backgroundColor: '#E74C3C',
                         marginTop: '0px',
                         marginBottom: '4px',
                    }}></div>

                    {additionalInfo && (
                         <div style={{
                              fontSize: '14px',
                              color: 'black',
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              fontWeight: '700',
                              marginBottom: '4px',
                              letterSpacing: '0.5px',
                         }} className={styles['company-additional-info']}>{additionalInfo}</div>
                    )}

                    <div style={{
                         fontSize: '14px',
                         color: 'black',
                         fontWeight: '700',
                         fontFamily: 'Arial, Helvetica, sans-serif',
                         marginBottom: '2px',
                    }} className={styles['company-address-fullwidth']}>{address}</div>

                    <div style={{
                         fontSize: '13px',
                         color: '#333',
                         fontFamily: 'Arial, Helvetica, sans-serif',
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