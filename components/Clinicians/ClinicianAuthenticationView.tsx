'use client';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
export default function View(){const id=useSearchParams().get('clinicianid');return <Link className="btn btn-outline-primary" href={id?`/doctor/access?clinicianid=${id}`:'/doctor/access'}>Manage practitioner access & invitations</Link>;}
