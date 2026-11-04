import React, { createContext, useState } from "react";
import { MultiBillingData, defaultMultiBillingData } from '../../../lib/Multi/MultiTypes';
import { handleCheckout } from "./checkoutMulti";

interface MultiBillingContextType {
	billingdata: MultiBillingData;
	setBillingData: React.Dispatch<React.SetStateAction<MultiBillingData>>;
	pricingPending?: boolean;
	recalculateTotalBill: (billingdata: MultiBillingData) => void | Promise<void>;
}

export const MultiBillingContext = createContext<MultiBillingContextType | undefined>(undefined);

export const MultiBillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }: {children?: React.ReactNode}) => {
	const [billingdata, setBillingData] = useState<MultiBillingData>(defaultMultiBillingData);
	const [pricingRequests,setPricingRequests]=useState(0);
	const recalculateTotalBill = (billingdata: MultiBillingData) => {
		if ((billingdata.cart && billingdata.cart.length > 0 ) || (billingdata.servicesProvided && billingdata.servicesProvided.length > 0)) {
			setPricingRequests(count=>count+1);
			return handleCheckout(billingdata, billingdata.specialCode ?? '', setBillingData).finally(()=>setPricingRequests(count=>count-1));
		}

	};

	return (
		<MultiBillingContext.Provider value={{ billingdata, setBillingData, recalculateTotalBill, pricingPending:pricingRequests>0 }}>
			{children}
		</MultiBillingContext.Provider>
	);
};
