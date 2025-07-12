import React, { createContext, useState } from "react";
import { MultiBillingData, defaultMultiBillingData } from '../../../lib/Multi/MultiTypes';

interface MultiBillingContextType {
	billingdata: MultiBillingData;
	setBillingData: React.Dispatch<React.SetStateAction<MultiBillingData>>;
	recalculateTotalBill: (billingdata: MultiBillingData) => void;
}

export const MultiBillingContext = createContext<MultiBillingContextType | undefined>(undefined);

export const MultiBillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [billingdata, setBillingData] = useState<MultiBillingData>(defaultMultiBillingData);
	const recalculateTotalBill = (billingdata) => {
		setBillingData({ ...billingdata });
	};

	return (
		<MultiBillingContext.Provider value={{ billingdata, setBillingData, recalculateTotalBill }}>
			{children}
		</MultiBillingContext.Provider>
	);
};
