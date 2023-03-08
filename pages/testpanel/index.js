import { Box, Container, Select } from '@mui/material';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import AddPanel from './add';

export default function TestPanel({categories}) {
    return (
        <>
            <Box  sx={{ width: '100%' }}>
                <AddPanel categories={categories} ></AddPanel>
            </Box>
        </>
    )
}




export async function getServerSideProps() {
    let endpoint = 'http://localhost:5000/api/v1/testpanel/categories'
    let getData = await fetch(endpoint)
    let response = await getData.json()
    console.log(response)
    return {
      props: {
        categories: response,
      }
    }
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