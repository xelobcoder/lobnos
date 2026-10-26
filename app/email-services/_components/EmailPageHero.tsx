import React from 'react';
import ui from '../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from '../email-standard.module.css';
type HeroStat={label:string;value:string|number};
export default function EmailPageHero({title,subtitle,icon,badge,stats=[]}:{title:string;subtitle:string;icon:React.ReactNode;badge?:string;stats?:HeroStat[]}){
 return <><header className={ui.header}><div className={ui.heading}><span className={ui.icon} aria-hidden="true">{icon}</span><div><span className={ui.eyebrow}>Communications / Email</span><h1>{title}</h1><p>{subtitle}</p></div></div>{badge&&<span className={ui.badge}>{badge}</span>}</header>{stats.length>0&&<div className={styles.metrics} aria-label="Email overview">{stats.map(stat=><div key={stat.label} className={ui.stat}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>}</>
}
