import {
  Box,
  Select,
  Container,
  TextField,
  Button,
  Breadcrumbs,
  Link,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import CategoryBread from '../../components/registration/testpanelBread';
import { useFormik } from 'formik'
import React from 'react'

export default function AddTestPanelCategory(props) {
  // category list
  const [list, setList] = React.useState(['Hematology', 'Microbiology', 'Immunology', 'Serology', 'Bacteriology', 'Virology', 'Parasitology', 'Chemistry', 'Pathology', 'Radiology', 'Sonography'])
  // formik form initial values
  const addcategory = useFormik({
    initialValues: {
      categoryname: '',
      categorydescription: '',
    },
    validate: (values) => {
        const errors = {}
        if (!values.categoryname) {
            errors.categoryname = 'Please kindly fill in category name'
        }
        if (!values.categorydescription) {
            errors.categorydescription = 'Please kindly fill in category description'
        }
        if(!values.categoryname && !values.categorydescription) {
            errors.categoryname = 'Please kindly fill in category name'
            errors.categorydescription = 'Please kindly fill in category description'
        }
        if(list.includes(values.categoryname)) {
            errors.categoryname = 'category name already exist'
        }
        return errors
    },
    onSubmit: (values) => {
      console.log(values)
    },
  })


  return (
    <>
      <CategoryBread section={'add category'} />
      <Container size={'sm'}>
      {addcategory.errors.categoryname && ( <Typography variant={'p'} color="error">{addcategory.errors.categoryname}</Typography>)}
        {addcategory.errors.categorydescription && ( <Typography color="error">{addcategory.errors.categorydescription}</Typography>)}
        <form onSubmit={addcategory.handleSubmit}>
          <Box
            sx={{
              margin: 0,
              padding: 0,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '20% auto 20%',
              gridGap: '10px 20px',
              marginTop: '10px',
            }}
          >
            <TextField
              size="small"
              value={addcategory.values.categoryname}
              onChange={addcategory.handleChange}
              autoFocus={true}
              label="Test Panel Category"
              name="categoryname"
              type="text"
              variant="outlined"
            />
            <TextField
              size="small"
              value={addcategory.values.categorydescription}
              onChange={addcategory.handleChange}
              label="Category description"
              multiline
              name="categorydescription"
              variant="outlined"
              rows={1}
            />
            <Button
              color="primary"
              variant="contained"
              type="submit"
              startIcon={<AddIcon />}
            >
              add
            </Button>
          </Box>
        </form>
      </Container>
    </>
  )
}

AddTestPanelCategory.getLayout = function (page) {
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
