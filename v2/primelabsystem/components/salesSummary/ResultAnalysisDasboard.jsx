import { AssignmentInd, House, Payment } from "@mui/icons-material";
import MainLayout from "../Layout/MainLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { FinancialDataKeys } from "./FinancialSummaryKeys";
import { useEffect, useState } from "react";
import ResultAnalysisSideBar from "../ResutlUI/ResultAnalysis/ResultAnalysisSidebar";

export default function ResultAnalysisDasboardLayout({ children }) {
     const [testList, setTestList] = useState([]);
     const router = useRouter();
     const targetKey = useSearchParams().get("targetKey");
     const [activeKey, setActiveKey] = useState(null);

     useEffect(() => { setActiveKey(targetKey) }, [targetKey])

     const sidebarLinks = [
          {
               title: "Sales", link: "/dashboard", icon: <AssignmentInd />, subLinks: [
                    ...FinancialDataKeys.map((item, index) => {
                         return {
                              title: item.label.toUpperCase(),
                              link: `/dashboard/sales/${item.key}`,
                              icon: <Payment />,
                         };
                    }),
               ],
          },
          { title: "Organization", link: "/dashboard/organization", icon: <House /> },
          { title: "Expense", link: "/expense/expenseslist", icon: <Payment /> },
          { title: "Result Analysis", link: "/dashboard/resultanalysis", icon: <Payment /> },
     ];


     async function fetchTestData() {
          try {
               const response = await customFetch("testpanel/list");
               setTestList(response?.data || []);
          } catch {
               setTestList([]);
          }
     }

     useEffect(() => { fetchTestData(); }, [])


     return (
          <MainLayout sideLinks={sidebarLinks}>
               <div className="d-flex flex-column flex-lg-row">
                    <div className="d-none  d-lg-flex col-lg-2 col-xl-2">
                         {/* <ListGroup className="br-0 ">
                              {FinancialDataKeys.map((item, index) => (
                                   <ListGroup.Item key={index} className={`text-uppercase pointer pls-color  overflow-grow whitespace-nowrap  ${activeKey == index ? "active text-white" : ""} text-sm`}>
                                        <Link
                                             className={activeKey == index ? "text-white" : ""}
                                             key={index}
                                             href={`/dashboard/sales/${item.key}?targetKey=${index}`}>

                                             {item.label}
                                        </Link>
                                   </ListGroup.Item>
                              ))}
                         </ListGroup> */}
                         <ResultAnalysisSideBar data={testList} />
                    </div>
                    <div className="col-12 col-lg-10 p-2" >
                         {children}
                    </div>
               </div>
          </MainLayout>
     );
}
