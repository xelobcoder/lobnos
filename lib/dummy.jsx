"use client"
import { AddReaction, ArrowForwardIos, MenuOpen } from "@mui/icons-material";
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
                <li className="grouper">
                    <div onClick={(ev) => { handleDropElements(1) }} className="link-group">
                        <span><AddReaction /></span>
                        <span>Billing Page Adeventure </span>
                        <span><ArrowForwardIos /> </span>
                    </div>
                    {target === 1 && <div className="futher-refer-mother">
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page Pending</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>pending count 60</span>
                                <span>70 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>pending count 60</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>
                <li className="grouper">
                    <div onClick={(ev) => { handleDropElements(2) }} className="link-group">
                        <span><AddReaction /></span>
                        <span>Billing Page Adeventure </span>
                        <span><ArrowForwardIos /> </span>
                    </div>
                    {target === 2 && <div className="futher-refer-mother">
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page Pending</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>
                <li className="grouper">
                    <div onClick={(ev) => { handleDropElements(3) }} className="link-group">
                        <span><AddReaction /></span>
                        <span>Billing Page Adeventure </span>
                        <span><ArrowForwardIos /> </span>
                    </div>
                    {target === 3 && <div className="futher-refer-mother">
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page Pending</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>
                <li className="grouper">
                    <div onClick={(ev) => { handleDropElements(4) }} className="link-group">
                        <span><AddReaction /></span>
                        <span>Billing Page Adeventure </span>
                        <span><ArrowForwardIos /> </span>
                    </div>
                    {target === 4 && <div className="futher-refer-mother">
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar/complete"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page Pending</span>
                                <span>60 </span>

                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                        <div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div><div className="futher-refer-child bg-warning-subtle">
                            <Link href={"/navbar"}>
                                <span><MenuOpen /></span>
                                <span>Billing Page completeFlow</span>
                                <span>60 </span>
                            </Link>
                        </div>
                    </div>}
                </li>
                <li>
                    <Link href={"/navbar/complete"}>
                        <span><AddReaction /></span>
                        <span>Billing Page Pending</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li  >
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page completeFlow</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li>
                <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li> <li>
                    <Link href={"/navbar"}>
                        <span><AddReaction /></span>
                        <span>Billing Page</span>
                        <span><ArrowForwardIos /> </span>
                    </Link>
                </li>
            </ul>
        </div>
    )
}


