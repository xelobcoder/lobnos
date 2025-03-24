import React from 'react';
import Link from 'next/link';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import styles from '../styles/header.module.css';
import ExpandedMenu from './ExpandedSidebarLinks';
import { Button, Col, Row } from 'react-bootstrap';
import { SidebarLinkType } from '../components/interfaces/departmentInterface';

export default function ApplicationSideBar({ expandedTarget, sidebarLinks, handleTarget, isExpanded = true, handleUnfold }) {


    const sidarUnfoldSvg = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy max-md:hidden"><path fillRule="evenodd" clipRule="evenodd" d="M8.85719 3H15.1428C16.2266 2.99999 17.1007 2.99998 17.8086 3.05782C18.5375 3.11737 19.1777 3.24318 19.77 3.54497C20.7108 4.02433 21.4757 4.78924 21.955 5.73005C22.2568 6.32234 22.3826 6.96253 22.4422 7.69138C22.5 8.39925 22.5 9.27339 22.5 10.3572V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118ZM11.5 5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V10.4C20.5 9.26339 20.4992 8.47108 20.4488 7.85424C20.3994 7.24907 20.3072 6.90138 20.173 6.63803C19.8854 6.07354 19.4265 5.6146 18.862 5.32698C18.5986 5.19279 18.2509 5.10062 17.6458 5.05118C17.0289 5.00078 16.2366 5 15.1 5H11.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor"></path></svg>


    return (
        <aside className={isExpanded ? styles.unfold : styles.sidebar}>
            <div className="d-none d-lg-block">
                <Row className=" my-0 my-lg-3">
                    <Col className='d-flex justify-content-center'>
                        <Button
                            onClick={handleUnfold}
                            className="text-white"
                            style={{ backgroundColor: '#111725' }}
                        >
                            {sidarUnfoldSvg}
                        </Button>
                    </Col>
                </Row>
            </div>

            <ul className={styles.sidebarList}>
                {sidebarLinks.map((item: SidebarLinkType, index: number) => {
                    const tooltipId = `tooltip-${index}`;
                    return (
                        <li className={styles.sidebarItem} key={index}>
                            <Link
                                onClick={(ev) => { !item?.subLinks && handleTarget(null) }}
                                href={item.subLinks ? '' : item.link}
                                className={styles.sidebarLink}
                                data-tooltip-id={tooltipId}
                            >
                                <span className={styles.icon}>
                                    {item.icon || <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 5V16H20V5H4ZM2 4.00748C2 3.45107 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44892 22 4.00748V18H2V4.00748ZM1 19H23V21H1V19Z"></path></svg>}
                                </span>
                                <span className={`${styles.linkText} mx-2`}>{item.title}</span>
                                {item.subLinks &&
                                    <span className={styles.dropdownArrow}>
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            onClick={(ev) => { handleTarget(index) }}
                                            width="24" height="24" viewBox="0 0 20 20" className="duration-100 ease-in transition transform">
                                            <g fill="none" fillRule="evenodd" transform="translate(-446 -398)">
                                                <path fill="currentColor" fillRule="nonzero" d="M95.8838835,240.366117 C95.3957281,239.877961 94.6042719,239.877961 94.1161165,240.366117 C93.6279612,240.854272 93.6279612,241.645728 94.1161165,242.133883 L98.6161165,246.633883 C99.1042719,247.122039 99.8957281,247.122039 100.383883,246.633883 L104.883883,242.133883 C105.372039,241.645728 105.372039,240.854272 104.883883,240.366117 C104.395728,239.877961 103.604272,239.877961 103.116117,240.366117 L99.5,243.982233 L95.8838835,240.366117 Z" transform="translate(356.5 164.5)"></path>
                                                <polygon points="446 418 466 418 466 398 446 398"></polygon>
                                            </g>
                                        </svg>
                                    </span>
                                }
                            </Link>
                            {(expandedTarget == index || expandedTarget == "all") && item.subLinks && Array.isArray(item.subLinks) && (
                                <ul className={styles.subLinks}>
                                    <ExpandedMenu item={item.subLinks} index={index} />
                                </ul>
                            )}
                        </li>
                    )
                })}
            </ul>
            {isExpanded && sidebarLinks.map((item: SidebarLinkType, index: number) => {
                const tooltipId = `tooltip-${index}`;
                return (
                    <ReactTooltip
                        key={tooltipId}
                        id={tooltipId}
                        place="bottom"
                        content={item.title}
                    />
                );
            })}
        </aside>
    );
}
