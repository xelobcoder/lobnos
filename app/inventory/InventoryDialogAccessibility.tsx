"use client";
import {useEffect, useRef} from 'react';
/** Adds keyboard behavior to existing inventory dialogs without changing their handlers. */
export default function InventoryDialogAccessibility({children}:{children:React.ReactNode}) {
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let active:HTMLElement|null=null, previous:HTMLElement|null=null;
  const sync=()=>{
   const dialogs=root.current?.querySelectorAll<HTMLElement>('.modal.show');
   const next=dialogs?.length ? dialogs[dialogs.length-1] : null;
   if(next===active)return;
   if(active && !next && previous?.isConnected)previous.focus();
   active=next;
   if(next){previous=document.activeElement as HTMLElement;next.setAttribute('role','dialog');next.setAttribute('aria-modal','true');
    const heading=next.querySelector<HTMLElement>('.modal-title');
    if(heading){if(!heading.id)heading.id='inventory-dialog-'+Math.random().toString(36).slice(2);next.setAttribute('aria-labelledby',heading.id);heading.tabIndex=-1;heading.focus();}
   }
  };
  const key=(event:KeyboardEvent)=>{
   if(!active)return;
   if(event.key==='Escape'){const close=active.querySelector<HTMLButtonElement>('.btn-close');if(close&&!close.disabled){event.preventDefault();close.click();}return;}
   if(event.key!=='Tab')return;
   const controls=Array.from(active.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(item=>item.getClientRects().length>0);
   if(!controls.length){event.preventDefault();return;}
   const index=controls.indexOf(document.activeElement as HTMLElement);
   if(event.shiftKey && index<=0){event.preventDefault();controls[controls.length-1].focus();}
   else if(!event.shiftKey&&(index<0||index===controls.length-1)){event.preventDefault();controls[0].focus();}
  };
  const observer=new MutationObserver(sync);if(root.current)observer.observe(root.current,{childList:true,subtree:true});document.addEventListener('keydown',key);sync();
  return()=>{observer.disconnect();document.removeEventListener('keydown',key);};
 },[]);
 return <div ref={root}>{children}</div>;
}
