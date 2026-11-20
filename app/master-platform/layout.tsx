import type {ReactNode} from 'react';
import styles from './platform.module.css';
export default function MasterPlatformLayout({children}:{children:ReactNode}) {
 return <div className={styles.fontScope}>{children}</div>;
}
