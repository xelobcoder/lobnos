'use client';
import React,{useLayoutEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './ModernWorkflow.module.css';
export function ModernPromptPortal({active,children}:{active:boolean;children:React.ReactNode}){
 const[host,setHost]=useState<HTMLElement|null>(null);
 useLayoutEffect(()=>{if(active){const next=document.getElementById('modern-workflow-prompts');if(next!==host)setHost(next);}});
 return active?(host?createPortal(children,host):null):<>{children}</>;
}
function InlinePrompt({show,children}:any){return show?<section className={styles.promptCard} aria-label="Billing confirmation">{children}</section>:null;}
export const InlineBillingPrompt=Object.assign(InlinePrompt,{
 Header:({children}:any)=><header className={styles.panelTitle}>{children}</header>,
 Title:({children}:any)=><h2>{children}</h2>,
 Body:({children}:any)=><div className={styles.promptBody}>{children}</div>,
 Footer:({children}:any)=><footer className={styles.promptFooter}>{children}</footer>,
});
