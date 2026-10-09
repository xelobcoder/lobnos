'use client';
import { useEffect, useState } from 'react';
import { getRequestContext } from '../serverActions/requestHeaders';
import { useApplication } from './useApplicationContext';
import { companyImageUrl } from '../../lib/companyImage';

export default function useCompanyImageUrl(): string {
     const application = useApplication();
     const [image, setImage] = useState<{ application: unknown; url: string } | null>(null);
     useEffect(() => {
          let cancelled = false;
          setImage(null);
          getRequestContext().then(context => {
               if (!cancelled) setImage({ application, url: companyImageUrl(context.tenantId) });
          }).catch(() => {
               if (!cancelled) setImage(null);
          });
          return () => { cancelled = true; };
     }, [application]);
     return image?.application === application ? image.url : '';
}
