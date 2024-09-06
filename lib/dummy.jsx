"use client"
import { AddReaction, ArrowForwardIos, MenuOpen, SignLanguage } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";

export default function OperationsServerRenderingSideBar() {
    const [target, setTarget] = useState(null);
    const handleDropElements = (value) => {
        value == target ? setTarget(0) : setTarget(value);
    }

    return (
        <div md={2} className="sidebar-macro-wrapper">
            <ul className="sidebar-macro-ui-class">
                <li className={`grouper `}>
                    <div onClick={(ev) => { handleDropElements(1) }} className={`link-group ${target == 1 && 'bg-primary text-white'}`}>
                        <span className="rxn-icon"><AddReaction /></span>
                        <span className="text-sidebar">Billing Page Adeventure </span>
                        <span className="drop-downicon"><ArrowForwardIos /> </span>
                    </div>
                    {target === 1 && <div className="futher-refer-mother">
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending collection</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending sample validation</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/processing"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">processing</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending approval</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>


                <li className={`grouper `}>
                    <div onClick={(ev) => { handleDropElements(3) }} className={`link-group ${target == 3 && 'bg-primary text-white'}`}>
                        <span className="rxn-icon"><AddReaction /></span>
                        <span className="text-sidebar">Billing Page Adeventure </span>
                        <span className="drop-downicon"><ArrowForwardIos /> </span>
                    </div>
                    {target === 3 && <div className="futher-refer-mother">
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending collection</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending sample validation</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/processing"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">processing</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending approval</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>
                <li className={`grouper `}>
                    <div onClick={(ev) => { handleDropElements(2) }} className={`link-group ${target == 2 && 'bg-primary text-white'}`}>
                        <span className="rxn-icon"><AddReaction /></span>
                        <span className="text-sidebar">Billing Page Adeventure </span>
                        <span className="drop-downicon"><ArrowForwardIos /> </span>
                    </div>
                    {target === 2 && <div className="futher-refer-mother">
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending collection</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending sample validation</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar/processing"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">processing</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">pending approval</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span className="text-sidebar">Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child ">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>               
            </ul>
        </div>
    )
}


