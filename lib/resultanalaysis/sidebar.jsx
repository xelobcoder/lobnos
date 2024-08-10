"use client"
import Link from "next/link";
import { customFetch } from "../../components/Auth/customFetch";
import { Add, Minimize, ViewAgenda, ViewAgendaOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResultAnalysisSideBar() {
    const [testList, setTestList] = useState([]);
    const [status, setStatus] = useState({ state: 'loading' });
    const queryparams = useSearchParams();
    const [expandTarget, setExpandTarget] = useState(0);

    useEffect(() => {
        async function getTestData() {
            try {
                const response = await customFetch("testpanel/list");
                const testList = await response?.data;
                setTestList(testList);
                setStatus({ status: 'complete' })
            } catch (err) {
                setTestList([]);
                setStatus({ state: 'error' })
            }
        }
        getTestData();
    }, []);


    useEffect(() => {
        if (queryparams && testList.length > 0) {
            const _expandedTarget = queryparams.get("expandTarget");
            if (!isNaN(_expandedTarget)) {
                const parsedTarget = parseInt(_expandedTarget);
                 setExpandTarget(parsedTarget)
            }
        }
    }, [queryparams, testList])






    const SIDEBAR = () => {
        return <div className=" result-anal-bar">
            <div className="p-2 ">
                <input className="form-control " />
            </div>
            <ul className="m-0 p-0">
                <li>
                    <div className="futher-refer-child ">
                        <span  >
                            <button className="btn btn-secondary p-0 m-1" >
                                <ViewAgendaOutlined />
                            </button>
                        </span>
                        <Link href={`/resultanalysis/alltest`}>
                            All test
                        </Link>
                    </div >
                </li>
                {testList.map((item, index) => {
                    return (
                        <li key={index + 1} onClick={(ev) => { expandTarget === item.id ? setExpandTarget(0) : setExpandTarget(item.id) }}>
                            <div className="futher-refer-child ">
                                <span  >
                                    <button className="btn btn-secondary p-0 m-1" >
                                        {expandTarget === item.id ? <Minimize style={{ marginTop: '-20px' }} /> : <Add />}
                                    </button>
                                </span>
                                <Link href={`/resultanalysis?expandTarget=${item.id}`}>
                                    {item.name}
                                </Link>
                            </div >
                            {expandTarget === item.id &&
                                (<div className="navbar-children-expanded">
                                    <Link href={`/resultanalysis/test?testid=${item.id}&&show=allcaseCount&&duration=month&&expandTarget=${item.id}`}>
                                        <ViewAgenda fontSize="sm" /> month case count
                                    </Link>
                                    <Link href={`/resultanalysis/test?testid=${item.id}&&show=allcaseCount&&duration=year&&expandTarget=${item.id}`}>
                                        <ViewAgenda fontSize="sm" />   Year Case Count
                                    </Link>
                                    <Link href={`/resultanalysis/test?testid=${item.id}&&show=resultvalues&&duration=month&&expandTarget=${item.id}`}>
                                        <ViewAgenda fontSize="sm" />   Month Result Values
                                    </Link>
                                </div>)}
                        </li>
                    )
                })}
            </ul>
        </div>
    }


    const renderingView = () => {
        if (status.state === "loading") {
            return <p>Loading tests ..........</p>
        } else if (status.state === "error") {
            return <p>error occured loading test</p>
        } else {
            return SIDEBAR()
        }
    }
    return (
        <div>
            {renderingView()}
        </div>
    )
}