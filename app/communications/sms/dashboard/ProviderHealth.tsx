"use client";
import React,{useEffect,useState} from 'react';
import Link from 'next/link';
import {customFetch} from '../../../../components/Auth/customFetch';
import styles from './dashboard.module.css';
function walletBalance(value:unknown){
 const match=typeof value==='string'?value.trim().match(/^GHS\s*([\d,]+(?:\.\d+)?)$/i):null;
 if(match){const amount=Number(match[1].replace(/,/g,''));if(Number.isFinite(amount))return 'GHS '+amount.toLocaleString('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2});}
 return typeof value==='string'&&value.trim()?value:'Unavailable';
}
export default function ProviderHealth(){
 const [data,setData]=useState<any>(null),[error,setError]=useState(false);
 useEffect(()=>{let current=true;customFetch('prime/sms-provider/health').then(result=>{if(!current)return;if(result?.status!=='success')throw new Error('Unavailable');setData(result.result);}).catch(()=>{if(current)setError(true);});return()=>{current=false;};},[]);
 if(error)return <div className={styles.providerStrip}><span>Provider health is unavailable.</span><Link href="/communications/sms/provider">Review connection</Link></div>;
 if(!data)return <p className={styles.footnote} role="status">Checking SMS credits…</p>;
 if(!data.configured)return <div className={styles.providerStrip}><span>Arkesel is not configured for this facility.</span><Link href="/communications/sms/provider">Configure SMS</Link></div>;
 const mode=data.pausedReason?'Paused':!data.isActive?'Disabled':data.sandbox?'Sandbox':'Live';
 return <section className={styles.providerAccount} aria-label="Arkesel account health">
 <div className={styles.providerHeading}><div><strong>SMS account</strong><span>Arkesel connection &amp; available credit</span></div><Link href="/communications/sms/provider">Manage provider →</Link></div>
 <div className={styles.providerMetrics}>
 <div><span>SMS credits</span><strong>{data.smsBalance==null||!Number.isFinite(Number(data.smsBalance))?'Unavailable':Number(data.smsBalance).toLocaleString()}</strong><small>Available for sending</small></div>
 <div><span>Wallet balance</span><strong>{walletBalance(data.mainBalance)}</strong><small>Provider account balance</small></div>
 <div><span>Sending mode</span><strong><span className={styles.providerBadge} data-tone={mode==='Live'?'live':'attention'}>{mode}</span></strong><small>{mode==='Live'?'Messages use SMS credits':mode==='Sandbox'?'Test mode — no live delivery':'Sending is not available'}</small></div>
 <div><span>Delivery protection</span><strong>{data.requireSignedWebhooks?'Signed callbacks':'Token verification'}</strong><small>{data.requireSignedWebhooks?'Callback signatures required':data.webhookConfigured?'Signing available in provider settings':'Standard callback verification'}</small></div>
 </div>
 {(data.balanceError||data.pausedReason||data.smsBalance!=null&&data.smsBalance<=data.lowCreditThreshold)&&<p className={styles.providerWarning} role="alert">{data.pausedReason||data.balanceError||'Low SMS credits — top up the Arkesel account before sending more campaigns.'}</p>}
 </section>;
}
