'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../../../../components/registration/RegistrationWrapper.module.css';

const sections = [
     { key: 'personal-information', label: 'Personal Information' },
     { key: 'addressing-information', label: 'Address' },
     { key: 'emergency-contact', label: 'Emergency Contact' },
     { key: 'credentials', label: 'Credentials' },
     { key: 'settings', label: 'Settings' },
];

export default function RegistrationSectionLayout({
     children,
     params,
}: {
     children: React.ReactNode;
     params: { patientid: string };
}) {
     const pathname = usePathname();
     const activeSection = pathname?.split('/').pop() || 'personal-information';
     const patientid = params.patientid;

     return (
          <div className={styles.updatePageWrapper}>
               <aside className={styles.sidebar}>
                    <div className={styles.sidebarTitle}>Registration Sections</div>
                    <div className={`list-group ${styles.sidebarNav}`}>
                         {sections.map((section, index) => (
                              <Link
                                   key={section.key}
                                   href={`/crm/registration/${patientid}/${section.key}`}
                                   className={`list-group-item list-group-item-action ${styles.sidebarItem} ${activeSection === section.key ? styles.activeSidebarItem : ''}`}
                              >
                                   <span className={styles.sidebarItemIndex}>{index + 1}</span>
                                   <span>{section.label}</span>
                              </Link>
                         ))}
                    </div>
               </aside>
               <div className={styles.contentArea}>{children}</div>
          </div>
     );
}
