import {Box,Breadcrumbs,Link,Typography} from '@mui/material';

export default function CategoryBread({section}) {
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '10px' }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/testpanel/add">
                        Add panel
                    </Link>
                    <Link
                     underline="hover"
                     color="inherit"
                     href="/testpanel/category"
                     >
                        Add category
                    </Link>
                    <Typography color="text.primary">{section}</Typography>
                </Breadcrumbs>
            </Box>
            <hr></hr>
        </>
    )
}