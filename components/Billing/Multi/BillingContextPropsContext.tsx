'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { billingContextProps } from '../../../lib/Multi/MultiTypes';

interface BillingContextPropsContextType {
     billingContextProps: billingContextProps;
     setBillingContextProps: React.Dispatch<React.SetStateAction<billingContextProps>>;
}

const BillingContextPropsContext = createContext<BillingContextPropsContextType | undefined>(undefined);

export const BillingContextPropsProvider: React.FC<{
     children: ReactNode;
     initialProps: billingContextProps;
}> = ({ children, initialProps }) => {
     const [billingContextProps, setBillingContextProps] = useState<billingContextProps>(initialProps);

     return (
          <BillingContextPropsContext.Provider value={{ billingContextProps, setBillingContextProps }}>
               {children}
          </BillingContextPropsContext.Provider>
     );
};

export const useBillingContextProps = () => {
     const context = useContext(BillingContextPropsContext);
     if (!context) {
          throw new Error('useBillingContextProps must be used within a BillingContextPropsProvider');
     }
     return context;
};




