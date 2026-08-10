import React from 'react';
import { Card } from 'react-bootstrap';
import styles from '../email-standard.module.css';

type HeroStat = {
     label: string;
     value: string | number;
};

type EmailPageHeroProps = {
     title: string;
     subtitle: string;
     icon: React.ReactNode;
     badge?: string;
     stats?: HeroStat[];
};

export default function EmailPageHero({ title, subtitle, icon, badge, stats = [] }: EmailPageHeroProps) {
     return (
          <Card className={styles.heroCard}>
               <Card.Body className={styles.heroBody}>
                    <div className={styles.heroTitleRow}>
                         <h5 className={styles.heroTitle}>
                              <span className={styles.heroIcon}>{icon}</span>
                              {title}
                         </h5>
                         {badge ? <span className={styles.heroBadge}>{badge}</span> : null}
                    </div>
                    <p className={styles.heroDescription}>{subtitle}</p>
                    {stats.length > 0 ? (
                         <div className={styles.heroStatsRow}>
                              {stats.map((stat) => (
                                   <div key={stat.label} className={styles.heroStatChip}>
                                        <span className={styles.heroStatLabel}>{stat.label}</span>
                                        <span className={styles.heroStatValue}>{stat.value}</span>
                                   </div>
                              ))}
                         </div>
                    ) : null}
               </Card.Body>
          </Card>
     );
}
