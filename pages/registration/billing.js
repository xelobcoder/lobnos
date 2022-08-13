import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { Box, Container } from "@mui/system";
export default function Billing() {
    const transactionid = useRouter().query.transactionid;
    return (
        <>
            <Box>
                <Container>
                    {
                        transactionid
                    }
                </Container>
            </Box>
        </>
    )
}



Billing.getLayout = function (page) {
    return (
        <>
            <Header />
            <div className="wrapper">
                <div className="side">
                    <SidebarFrontPage />
                </div>
                <div className="main">{page}</div>
            </div>
        </>
    )
}