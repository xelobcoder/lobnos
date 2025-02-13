"use client"
import React from "react";
import TRFFormPdf from "../../../components/Billing/ReceiptPdfs/TRFFORMPDF";

export default function TRFPAGE() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <TRFFormPdf />
        </div>
    );
}
