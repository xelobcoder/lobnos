'use client'
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const SidebarItem = ({ item, expandTarget, setExpandTarget }) => {
    const isExpanded = expandTarget === item.id;

    const iconup = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 13.9142L16.7929 18.7071L18.2071 17.2929L12 11.0858L5.79289 17.2929L7.20711 18.7071L12 13.9142ZM6 7L18 7V9L6 9L6 7Z"></path></svg>
    return (
        <li>
            <div
                onClick={() => setExpandTarget(isExpanded ? 0 : item.id)}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: isExpanded ? "#232529" : "transparent",
                    color: isExpanded ? "#fff" : "#d1d5db",
                    cursor: "pointer",
                    borderRadius: "4px",
                    transition: "background-color 0.3s ease",
                    marginBottom: "5px",
                }}
            >
                <span>{item.title}</span>
                {/* {isExpanded ? (
                    
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 10.0858L7.20712 5.29291L5.79291 6.70712L12 12.9142L18.2071 6.70712L16.7929 5.29291L12 10.0858ZM18 17L6.00001 17L6.00001 15L18 15V17Z"></path></svg>
                )} */}
            </div>
            {isExpanded && (
                <div
                    style={{
                        backgroundColor: "#2c2f33",
                        marginTop: "5px",
                        padding: "10px",
                        borderRadius: "4px",
                    }}
                >
                    <ExpandedMenu itemId={item.id} />
                </div>
            )}
        </li>
    );
};

const ExpandedMenu = ({ itemId }) => (
    <>
        <Link
            href={`/dashboard/resultanalysis/monthcasecount?testid=${itemId}&show=allcaseCount&duration=month&expandTarget=${itemId}`}
            style={{
                display: "block",
                marginBottom: "8px",
                color: "#61dafb",
                textDecoration: "none",
                fontSize: "14px",
            }}
        >
            Month Case Count
        </Link>
        <Link
            href={`/dashboard/resultanalysis/yearmonthcasescount?testid=${itemId}&show=allcaseCount&duration=year&expandTarget=${itemId}`}
            style={{
                display: "block",
                marginBottom: "8px",
                color: "#61dafb",
                textDecoration: "none",
                fontSize: "14px",
            }}
        >
            Year Case Count
        </Link>
        <Link
            href={`/dashboard/resultanalysis/monthresultsvalues?testid=${itemId}&show=resultvalues&duration=month&expandTarget=${itemId}&isGroupedByDate=0`}
            style={{
                display: "block",
                color: "#61dafb",
                textDecoration: "none",
                fontSize: "14px",
            }}
        >
            Month Result Values
        </Link>
    </>
);

const sidebarLinks = [
    { title: "Stocks", link: "/inventory", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8.00488 5.00281H11.0049V14.0028H8.00488V17.0028H6.00488V14.0028H3.00488V5.00281H6.00488V2.00281H8.00488V5.00281ZM5.00488 7.00281V12.0028H9.00488V7.00281H5.00488ZM18.0049 10.0028H21.0049V19.0028H18.0049V22.0028H16.0049V19.0028H13.0049V10.0028H16.0049V7.00281H18.0049V10.0028ZM15.0049 12.0028V17.0028H19.0049V12.0028H15.0049Z"></path></svg> },
    {
        title: "Expires Stocks",
        link: "/inventory/expirestocks",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 18H21V6H3V18ZM1 5C1 4.44772 1.44772 4 2 4H22C22.5523 4 23 4.44772 23 5V19C23 19.5523 22.5523 20 22 20H2C1.44772 20 1 19.5523 1 19V5ZM9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11C8.55228 11 9 10.5523 9 10ZM11 10C11 11.6569 9.65685 13 8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10ZM8.0018 16C7.03503 16 6.1614 16.3907 5.52693 17.0251L4.11272 15.6109C5.10693 14.6167 6.4833 14 8.0018 14C9.52031 14 10.8967 14.6167 11.8909 15.6109L10.4767 17.0251C9.84221 16.3907 8.96858 16 8.0018 16ZM17.7929 8.79289L16 10.5858L14.2071 8.79289L12.7929 10.2071L14.5858 12L12.7929 13.7929L14.2071 15.2071L16 13.4142L17.7929 15.2071L19.2071 13.7929L17.4142 12L19.2071 10.2071L17.7929 8.79289Z"></path></svg>,
    },
    {
        title: "General Store",
        link: "/inventory/stocksrequest",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 11.6458V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11.6458C2.37764 10.9407 2 10.0144 2 9V3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44772 22 3V9C22 10.0144 21.6224 10.9407 21 11.6458ZM19 12.874C18.6804 12.9562 18.3453 13 18 13C16.8053 13 15.7329 12.4762 15 11.6458C14.2671 12.4762 13.1947 13 12 13C10.8053 13 9.73294 12.4762 9 11.6458C8.26706 12.4762 7.19469 13 6 13C5.6547 13 5.31962 12.9562 5 12.874V20H19V12.874ZM14 9C14 8.44772 14.4477 8 15 8C15.5523 8 16 8.44772 16 9C16 10.1046 16.8954 11 18 11C19.1046 11 20 10.1046 20 9V4H4V9C4 10.1046 4.89543 11 6 11C7.10457 11 8 10.1046 8 9C8 8.44772 8.44772 8 9 8C9.55228 8 10 8.44772 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9Z"></path></svg>
    },
    {
        title: "Dispatch Approved",
        link: "/inventory/stocksrequest/dispatch",
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4.00436 6.41686L0.761719 3.17422L2.17593 1.76001L5.41857 5.00265H20.6603C21.2126 5.00265 21.6603 5.45037 21.6603 6.00265C21.6603 6.09997 21.6461 6.19678 21.6182 6.29L19.2182 14.29C19.0913 14.713 18.7019 15.0027 18.2603 15.0027H6.00436V17.0027H17.0044V19.0027H5.00436C4.45207 19.0027 4.00436 18.5549 4.00436 18.0027V6.41686ZM6.00436 7.00265V13.0027H17.5163L19.3163 7.00265H6.00436ZM5.50436 23.0027C4.67593 23.0027 4.00436 22.3311 4.00436 21.5027C4.00436 20.6742 4.67593 20.0027 5.50436 20.0027C6.33279 20.0027 7.00436 20.6742 7.00436 21.5027C7.00436 22.3311 6.33279 23.0027 5.50436 23.0027ZM17.5044 23.0027C16.6759 23.0027 16.0044 22.3311 16.0044 21.5027C16.0044 20.6742 16.6759 20.0027 17.5044 20.0027C18.3328 20.0027 19.0044 20.6742 19.0044 21.5027C19.0044 22.3311 18.3328 23.0027 17.5044 23.0027Z"></path></svg>,
    },
    { title: "Warehouse", link: "/inventory/warehouse", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 19H23V21H1V19H3V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V19H19V11H17V9H20C20.5523 9 21 9.44772 21 10V19ZM5 5V19H13V5H5ZM7 11H11V13H7V11ZM7 7H11V9H7V7Z"></path></svg> },
    { title: "Inventory Analytics", link: "/inventory/analytics", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 2.4578V4.58152C6.06817 5.76829 4 8.64262 4 12C4 16.4183 7.58172 20 12 20C15.3574 20 18.2317 17.9318 19.4185 15H21.5422C20.2679 19.0571 16.4776 22 12 22C6.47715 22 2 17.5228 2 12C2 7.52236 4.94289 3.73207 9 2.4578ZM12 2C17.5228 2 22 6.47715 22 12C22 12.3375 21.9833 12.6711 21.9506 13H11V2.04938C11.3289 2.01672 11.6625 2 12 2ZM13 4.06189V11H19.9381C19.4869 7.38128 16.6187 4.51314 13 4.06189Z"></path></svg> },
    { title: "Wastage Analytics", link: "/inventory/analytics/wastage", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13 19.9C15.2822 19.4367 17 17.419 17 15V12C17 11.299 16.8564 10.6219 16.5846 10H7.41538C7.14358 10.6219 7 11.299 7 12V15C7 17.419 8.71776 19.4367 11 19.9V14H13V19.9ZM5.5358 17.6907C5.19061 16.8623 5 15.9534 5 15H2V13H5V12C5 11.3573 5.08661 10.7348 5.2488 10.1436L3.0359 8.86602L4.0359 7.13397L6.05636 8.30049C6.11995 8.19854 6.18609 8.09835 6.25469 8H17.7453C17.8139 8.09835 17.88 8.19854 17.9436 8.30049L19.9641 7.13397L20.9641 8.86602L18.7512 10.1436C18.9134 10.7348 19 11.3573 19 12V13H22V15H19C19 15.9534 18.8094 16.8623 18.4642 17.6907L20.9641 19.134L19.9641 20.866L17.4383 19.4077C16.1549 20.9893 14.1955 22 12 22C9.80453 22 7.84512 20.9893 6.56171 19.4077L4.0359 20.866L3.0359 19.134L5.5358 17.6907ZM8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6H8Z"></path></svg> },
    { title: "PO to GRN", link: "/inventory/analytics/purchasesflow", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18 3V5H17V11L19 14V16H13V23H11V16H5V14L7 11V5H6V3H18ZM9 5V11.6056L7.4037 14H16.5963L15 11.6056V5H9Z"></path></svg> },
    { title: "Settings", link: "/inventory/settings", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13 19.9C15.2822 19.4367 17 17.419 17 15V12C17 11.299 16.8564 10.6219 16.5846 10H7.41538C7.14358 10.6219 7 11.299 7 12V15C7 17.419 8.71776 19.4367 11 19.9V14H13V19.9ZM5.5358 17.6907C5.19061 16.8623 5 15.9534 5 15H2V13H5V12C5 11.3573 5.08661 10.7348 5.2488 10.1436L3.0359 8.86602L4.0359 7.13397L6.05636 8.30049C6.11995 8.19854 6.18609 8.09835 6.25469 8H17.7453C17.8139 8.09835 17.88 8.19854 17.9436 8.30049L19.9641 7.13397L20.9641 8.86602L18.7512 10.1436C18.9134 10.7348 19 11.3573 19 12V13H22V15H19C19 15.9534 18.8094 16.8623 18.4642 17.6907L20.9641 19.134L19.9641 20.866L17.4383 19.4077C16.1549 20.9893 14.1955 22 12 22C9.80453 22 7.84512 20.9893 6.56171 19.4077L4.0359 20.866L3.0359 19.134L5.5358 17.6907ZM8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6H8Z"></path></svg>  },
    { title: "Create LIMS Template", link: "/inventory/autoLaboratorydeductions", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13 19.9C15.2822 19.4367 17 17.419 17 15V12C17 11.299 16.8564 10.6219 16.5846 10H7.41538C7.14358 10.6219 7 11.299 7 12V15C7 17.419 8.71776 19.4367 11 19.9V14H13V19.9ZM5.5358 17.6907C5.19061 16.8623 5 15.9534 5 15H2V13H5V12C5 11.3573 5.08661 10.7348 5.2488 10.1436L3.0359 8.86602L4.0359 7.13397L6.05636 8.30049C6.11995 8.19854 6.18609 8.09835 6.25469 8H17.7453C17.8139 8.09835 17.88 8.19854 17.9436 8.30049L19.9641 7.13397L20.9641 8.86602L18.7512 10.1436C18.9134 10.7348 19 11.3573 19 12V13H22V15H19C19 15.9534 18.8094 16.8623 18.4642 17.6907L20.9641 19.134L19.9641 20.866L17.4383 19.4077C16.1549 20.9893 14.1955 22 12 22C9.80453 22 7.84512 20.9893 6.56171 19.4077L4.0359 20.866L3.0359 19.134L5.5358 17.6907ZM8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6H8Z"></path></svg>  },
]


export default function ResultAnalysisSideBar() {
    const [testList, setTestList] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [status, setStatus] = useState("loading");
    const [expandTarget, setExpandTarget] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const queryParams = useSearchParams();



    const renderSidebarContent = () => {
        return (
            <ul style={{ padding: 0, listStyleType: "none", marginTop: "10px" }}>
                <li>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#232529",
                            color: "#d1d5db",
                            cursor: "pointer",
                            borderRadius: "4px",
                            marginBottom: "5px",
                        }}
                    >
                        <Link
                            href={`/dashboard/resultanalysis/alltest`}
                            style={{ textDecoration: "none", color: "#d1d5db" }}
                        >
                          All Tests
                        </Link>
                    </div>
                </li>
                {sidebarLinks.map((item,index) => (
                    <SidebarItem
                        key={index}
                        item={item}
                        expandTarget={expandTarget}
                        setExpandTarget={setExpandTarget}
                    />
                ))}
            </ul>
        );
    };

    return (
        <div
            style={{
                width: "280px",
                // height: "100vh",
                backgroundColor: "#1e1f23",
                // backgroundColor: "#0d6efd",
                color: "#d1d5db",
                padding: "10px",
                borderRight: "1px solid #2c2f33",
                overflowY: "auto",
            }}
        >
            <div style={{ paddingBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #2c2f33",
                        borderRadius: "4px",
                        backgroundColor: "#2c2f33",
                        color: "#d1d5db",
                    }}
                />
            </div>
            {renderSidebarContent()}
        </div>
    );
}
