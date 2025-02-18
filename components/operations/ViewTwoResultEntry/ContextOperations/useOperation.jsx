import { createContext, useState } from "react";
import { toast } from "react-toastify";

const contextInfo = {
	viewDetails: false,
	loadtest: true,
	minifyClientInfo: true,
	patientInfo: {},
	patientid: null,
	billingid: null,
	showSlideRightIcon: true,
	showSlideLeftIcon: true,
	employeeid: null,
	testid: null,
	isInitLoading: true,
	testList: [],
	toast,
	uiLayout: 2,
	showPatientData: true,
	showTestCollection: true,
	showPreviousRecords: false,
	showPrevTcount: false,
};

export const useOperation = createContext(contextInfo);
export default function UseOperationContext({ children }) {
	const [operations, setOperations] = useState(contextInfo);
	const updateContext = (current) => {
		setOperations(current);
	};
	return <useOperation.Provider value={{ operations, updateContext }}>{children}</useOperation.Provider>;
}
