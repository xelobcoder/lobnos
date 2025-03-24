"use client";
import React from 'react';
import CardRacks from '../../../accessories/CardRack';
import Loader from '../../../accessories/Loader';
import { currencyFormatter } from '../../../../Lib/fetcher';
import { GeneralLosessSummaryType } from '../../../interfaces/departmentInterface';

type GeneralLosessSummaryProps = {
    isLoading: boolean,
    active: number | string,
    generalSummary: GeneralLosessSummaryType,
    endpoint: string
}

const viewQuarterSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path>
    </svg>
);

export default function GeneralLosessSummary({ isLoading, active, generalSummary, endpoint }: GeneralLosessSummaryProps) {
    const { firstQ, secondQ, thirdQ, totalWastage } = generalSummary;

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 col-md-4 mb-4">
                    <CardRacks
                        header={<h6 className='pointer d-flex justify-content-between'>
                            <span>1st Quarter</span>
                            <span>{viewQuarterSvg}</span>
                        </h6>}
                        activestate={active === 1}
                        body={
                            isLoading ? (
                                <Loader />
                            ) : (
                                <h3 className="mx-3">{currencyFormatter.format(firstQ || 0)}</h3>
                            )
                        }
                    />
                </div>
                <div className="col-12 col-md-4 mb-4">
                    <CardRacks
                        activestate={active === 2}
                        header={<h6 className='d-flex justify-content-between'>
                            <span>2nd Quarter</span>
                            <span>{viewQuarterSvg}</span>
                        </h6>}
                        body={
                            isLoading ? (
                                <Loader />
                            ) : (
                                <h3 className="mx-3">{currencyFormatter.format(secondQ || 0)}</h3>
                            )
                        }
                    />
                </div>
                <div className="col-12 col-md-4 mb-4">
                    <CardRacks
                        activestate={active === 3}
                        header={<h6 className='d-flex justify-content-between'>
                            <span>3rd Quarter</span>
                            <span>{viewQuarterSvg}</span>
                        </h6>}
                        body={
                            isLoading ? (
                                <Loader />
                            ) : (
                                <h3 className="mx-3">{currencyFormatter.format(thirdQ || 0)}</h3>
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}
