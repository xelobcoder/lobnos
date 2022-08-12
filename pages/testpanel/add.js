import Header from '../../components/header';
import { Box, TextField, Select, Stack, Button, FormControl, InputLabel, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import CategoryBread from '../../components/registration/testpanelBread';



export default function AddPanel() {
    const addpanel = useFormik({
        initialValues: {},
        handleSubmit: (values) => {
            console.log(values);
        }
    })
    return (
        <>
            <CategoryBread section={'Panel'} />
            <Box sx={{ width: '80%', margin: '2% 2% 0% 2%' }}>
                <form onSubmit={addpanel.handleSubmit}>
                    <Stack sx={{ display: 'grid', gridTemplateColumns: '28% 28% 28% auto', gridGap: "10px 10px" }}>
                        <TextField size='small' label="Panel Name" name="panelname" type='text' variant='filled' />
                        <FormControl>
                            <InputLabel htmlFor="category">category</InputLabel>
                            <Select size='small' variant='filled'>

                            </Select>
                        </FormControl>
                        <TextField size='small' label='price' type='number' name='price' mt={10} variant='filled' />
                        <Button size='small' variant='contained' type='button' startIcon={<AddIcon />}>add</Button>
                    </Stack>
                </form>
            </Box>
        </>
    )
}




AddPanel.getLayout = function (page) {
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