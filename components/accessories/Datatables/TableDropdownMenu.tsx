'use client';
import {useEffect,useState,forwardRef} from 'react';
import {createPortal} from 'react-dom';
import {Dropdown} from 'react-bootstrap';
import type {DropdownMenuProps} from 'react-bootstrap/DropdownMenu';
import styles from './TableDropdownMenu.module.css';
/** Keep action menus out of scroll containers while retaining Bootstrap keyboard and root-close behavior. */
const TableDropdownMenu=forwardRef<HTMLDivElement,DropdownMenuProps>(function TableDropdownMenu({children,className='',popperConfig,...props},ref){
 const [container,setContainer]=useState<HTMLElement|null>(null);
 useEffect(()=>{setContainer(document.body)},[]);
 if(!container)return null;
 return createPortal(<Dropdown.Menu {...props} ref={ref} className={`${styles.menu} ${className}`} popperConfig={{...popperConfig,strategy:'fixed',modifiers:[...(popperConfig?.modifiers||[]),{name:'flip',options:{rootBoundary:'viewport',padding:8}},{name:'preventOverflow',options:{rootBoundary:'viewport',boundary:'viewport',altAxis:true,padding:8}}]}}>{children}</Dropdown.Menu>,container);
});
export default TableDropdownMenu;
