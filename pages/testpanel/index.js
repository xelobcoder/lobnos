import { Box, Container, Select } from '@mui/material';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import AddPanel from './add';

export default function TestPanel() {
    return (
        <>
            <Box  sx={{ width: '100%' }}>
                <AddPanel ></AddPanel>
            </Box>
        </>
    )
}











TestPanel.getLayout = function (page) {
    return (
        <>
            <Header />
            <div className="wrapper">
                <div className="side">
                    <SidebarFrontPage />
                </div>
                <div className="main">
                    {page}
                </div>
            </div>
        </>
    )
}