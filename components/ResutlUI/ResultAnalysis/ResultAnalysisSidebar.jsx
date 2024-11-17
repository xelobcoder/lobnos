import Link from "next/link";
import { customFetch } from "../../Auth/customFetch";
import { ExpandLess, ExpandMore, ViewAgendaOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SidebarItem = ({ item, expandTarget, setExpandTarget }) => {
    const isExpanded = expandTarget === item.id;

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
                <span>{item.name}</span>
                {isExpanded ? (
                    <ExpandLess style={{ color: isExpanded ? "#fff" : "#d1d5db" }} />
                ) : (
                    <ExpandMore />
                )}
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
            <ViewAgendaOutlined fontSize="small" /> Month Case Count
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
            <ViewAgendaOutlined fontSize="small" /> Year Case Count
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
            <ViewAgendaOutlined fontSize="small" /> Month Result Values
        </Link>
    </>
);

export default function ResultAnalysisSideBar() {
    const [testList, setTestList] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [status, setStatus] = useState("loading");
    const [expandTarget, setExpandTarget] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const queryParams = useSearchParams();

    useEffect(() => {
        async function fetchTestData() {
            try {
                const response = await customFetch("testpanel/list");
                setTestList(response?.data || []);
                setFilteredTests(response?.data || []);
                setStatus("complete");
            } catch {
                setTestList([]);
                setFilteredTests([]);
                setStatus("error");
            }
        }
        fetchTestData();
    }, []);

    useEffect(() => {
        if (queryParams && testList.length > 0) {
            const target = queryParams.get("expandTarget");
            if (target && !isNaN(target)) {
                setExpandTarget(parseInt(target, 10));
            }
        }
    }, [queryParams, testList]);

    useEffect(() => {
        const filtered = testList.filter((test) =>
            test.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTests(filtered);
    }, [searchTerm, testList]);

    const renderSidebarContent = () => {
        if (status === "loading") return <p>Loading tests...</p>;
        if (status === "error") return <p>Error occurred while loading tests.</p>;

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
                            <ViewAgendaOutlined /> All Tests
                        </Link>
                    </div>
                </li>
                {filteredTests.map((item) => (
                    <SidebarItem
                        key={item.id}
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
                height: "100vh",
                backgroundColor: "#1e1f23",
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
