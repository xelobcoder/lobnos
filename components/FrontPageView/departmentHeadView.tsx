"use client";
import Link from 'next/link';
import {useApplication} from '../Auth/useApplicationContext';
export default function DepartmentHeadView(){const {user}=useApplication();const imaging=String(user?.role).replace(/[ _-]/g,'').toLowerCase()==='headofimaging';return <section className="card p-4"><h1>{imaging?'Head of Imaging':'Head of Laboratory'}</h1><p className="text-muted">Request supplies from stores and review your department's approved, issued and remaining stock.</p><div><Link className="btn btn-primary" href={imaging?'/operations/imaging/ultrasound/requisitions':'/operations/laboratory/requisitions'}>Open requisitions</Link></div></section>;}
