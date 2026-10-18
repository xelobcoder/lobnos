import { RiCustomerService2Line, RiMailLine, RiMapPinLine, RiPhoneLine } from '@remixicon/react';
import type { FacilityContact } from '../../lib/patientPortal';
import styles from './PortalShell.module.css';

/** How to reach the laboratory; shown on the home page and wherever a patient may need help. */
export default function FacilityContactCard({ facility }: { facility: FacilityContact | null | undefined }) {
    if (!facility || ![facility.name, facility.phone, facility.email, facility.address, facility.help].some(Boolean)) return null;
    return (
        <section className={styles.panel} aria-labelledby="portal-contact-title">
            <h2 id="portal-contact-title" className={styles.panelTitle}><RiCustomerService2Line size={18} aria-hidden="true" />Need help?</h2>
            {facility.name && <p className="fw-semibold mb-2">{facility.name}</p>}
            {facility.help && <p className="mb-2">{facility.help}</p>}
            <ul className={styles.contactList}>
                {facility.phone && <li><RiPhoneLine size={16} aria-hidden="true" /><a href={`tel:${facility.phone.replace(/[^\d+]/g, '')}`}>{facility.phone}</a></li>}
                {facility.email && <li><RiMailLine size={16} aria-hidden="true" /><a href={`mailto:${facility.email}`}>{facility.email}</a></li>}
                {facility.address && <li><RiMapPinLine size={16} aria-hidden="true" /><span>{facility.address}</span></li>}
            </ul>
        </section>
    );
}
