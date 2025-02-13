"use client"
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import TRFFormDocument from './TRFFormDocument';

const TRFFormPdf = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            {isLoading ? (
                <div >
                    <p>Loading...</p>
                </div>
            ) : (
                    <PDFDownloadLink
                        document={<TRFFormDocument />}
                        fileName={`trf_POS.pdf`}
                    >
                        {({ loading }) =>
                            loading ? "Generating PDF..." : (
                                <button className="btn btn-sm btn-primary" style={{ marginRight: "10px" }}>
                                    Download PDF in POS format
                                </button>
                            )
                        }
                    </PDFDownloadLink>
            )}
        </div>
    );
};

export default TRFFormPdf;