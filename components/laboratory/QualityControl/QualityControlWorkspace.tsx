'use client';
import { ComponentType, useState, useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import s from './QualityControlWorkspace.module.css';
export type QCSection = 'dashboard' | 'sessions' | 'new-session' | 'controls' | 'devices' | 'setup';
const sections: {key: QCSection; title: string; description: string}[] = [
 {key:'dashboard',title:'Overview',description:'Monitor today’s activity, review alerts and check recent control readings.'},
 {key:'sessions',title:'QC sessions',description:'Find recorded sessions, review readings and inspect Levey–Jennings charts.'},
 {key:'new-session',title:'New session',description:'Choose a device and its control material to create a QC session.'},
 {key:'controls',title:'Control materials',description:'Manage control lots, expiry dates and parameter limits.'},
 {key:'devices',title:'Devices',description:'Manage laboratory instruments and their calibration schedules.'},
 {key:'setup',title:'Setup',description:'Review how QC rules and notification settings are configured.'},
];
export function QualityControlWorkspace({panels}:{panels:Record<QCSection,ComponentType>}) {
 const [active,setActive]=useState<QCSection>('dashboard');
 useEffect(()=>{const tab=new URLSearchParams(window.location.search).get('tab');if(sections.some(s=>s.key===tab))setActive(tab as QCSection)},[]);
 return <main className={s.workspace}>
  <header className={s.header}><div><small>LABORATORY OPERATIONS</small><h1>Quality control</h1><p>Keep instruments, control materials and quality reviews in one workspace.</p></div><button type="button" className="btn btn-primary" disabled={active==='new-session'} onClick={()=>setActive('new-session')}>New QC session</button></header>
  <nav className={s.links} aria-label="Laboratory operations"><a href="/operations/laboratory/criticalvaluesAlert">Critical results</a><a href="/operations/laboratory/workbench">Assigned work</a><a href="/operations/laboratory/undelivered">Result delivery</a></nav>
  <Tabs id="quality-control-sections" activeKey={active} onSelect={key=>{if(sections.some(item=>item.key===key))setActive(key as QCSection)}} className={s.tabs}>
   {sections.map(section=>{const Panel=panels[section.key];return <Tab key={section.key} eventKey={section.key} title={section.title}><section className={s.content} aria-label={section.title}><div className={s.sectionHeading}><h2>{section.title}</h2><p>{section.description}</p></div>{active===section.key&&<Panel/>}</section></Tab>})}
  </Tabs>
 </main>
}
