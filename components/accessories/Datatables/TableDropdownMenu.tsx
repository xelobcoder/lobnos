'use client';
import {useEffect,useState,useId,forwardRef} from 'react';
import {createPortal} from 'react-dom';
import {Dropdown} from 'react-bootstrap';
import type {DropdownMenuProps} from 'react-bootstrap/DropdownMenu';
import type {DropdownProps} from 'react-bootstrap/Dropdown';
import styles from './TableDropdownMenu.module.css';

const openMenuEvent = 'pls:table-action-menu-open';
/** Coordinate row menus across tables without replacing Bootstrap selection/keyboard behavior. */
export function TableDropdown({children,onToggle,...props}: Omit<DropdownProps,'show'>) {
 const id=useId();
 const [show,setShow]=useState(false);
 useEffect(()=>{
  const closeOther=(event:Event)=>{if((event as CustomEvent<string>).detail!==id)setShow(false)};
  window.addEventListener(openMenuEvent,closeOther);
  return ()=>window.removeEventListener(openMenuEvent,closeOther);
 },[id]);
 return <Dropdown {...props} show={show} autoClose onToggle={(next,metadata)=>{
  if(next)window.dispatchEvent(new CustomEvent(openMenuEvent,{detail:id}));
  setShow(next);
  onToggle?.(next,metadata);
 }}>{children}</Dropdown>;
}
/** Keep action menus out of scroll containers while retaining Bootstrap keyboard and root-close behavior. */
const TableDropdownMenu=forwardRef<HTMLDivElement,DropdownMenuProps>(function TableDropdownMenu({children,className='',popperConfig,...props},ref){
 const [container,setContainer]=useState<HTMLElement|null>(null);
 useEffect(()=>{setContainer(document.body)},[]);
 if(!container)return null;
 return createPortal(<Dropdown.Menu {...props} ref={ref} className={`${styles.menu} ${className}`} popperConfig={{...popperConfig,strategy:'fixed',modifiers:[...(popperConfig?.modifiers||[]),{name:'flip',options:{rootBoundary:'viewport',boundary:'viewport',padding:8}},{name:'preventOverflow',options:{rootBoundary:'viewport',boundary:'viewport',altAxis:true,padding:8}},{name:'computeStyles',options:{adaptive:false,gpuAcceleration:false}},{name:'hide',enabled:false}]}}>{children}</Dropdown.Menu>,container);
});
export default TableDropdownMenu;
