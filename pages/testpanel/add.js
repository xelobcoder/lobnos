import Header from '../../components/header'
import {
  Box,
  TextField,
  Select,
  Stack,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SidebarFrontPage from '../../components/frontpagesidebar'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { useFormik } from 'formik'
import CategoryBread from '../../components/registration/testpanelBread'

export default function AddPanel({ categories }) {
  const [category, setCategory] = useState(categories||[])
  const formReset = useRef()
  console.log(categories)
  const addpanel = useFormik({
    initialValues: {
      name: '',
      category: '',
      price: '',
    },
    validate: (values) => {
      let errors = {}
      if (!values.name) {
        errors.name = 'test name required'
      }
    },
    onSubmit: (values, reset) => {
      let sendData = async function () {
        let pushdata = await fetch('http://localhost:3000/api/testpanel/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
        return pushdata
      }

      sendData()
        .then((response) => {
          return response.json()
        })
        .then((response) => {
          if (response == 'test panel successfully added') {
            reset.resetForm()
          }
        })
        .catch((err) => {
          throw err
        })
    },
  })
  return (
    <>
      <CategoryBread section={'Panel'} />
      <Box sx={{ width: '80%', margin: '2% 2% 0% 2%' }}>
        <form onSubmit={addpanel.handleSubmit} ref={formReset}>
          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: '28% 28% 28% auto',
              gridGap: '10px 10px',
            }}
          >
            <div>
              <TextField
                onChange={addpanel.handleChange}
                value={addpanel.values.name}
                size="small"
                label="Panel Name"
                name="name"
                type="text"
                variant="filled"
              />
              {addpanel.errors.name && (
                <Typography variant="p" color="error">
                  {addpanel.errors.name}
                </Typography>
              )}
            </div>
            <FormControl>
              <InputLabel htmlFor="category">category</InputLabel>
              <Select
                size="small"
                variant="filled"
                name="category"
                value={addpanel.values.category}
                onChange={addpanel.handleChange}
              >
                {category.map((option) => {
                  return (
                    <MenuItem key={option.ID} value={option.CATEGORY}>
                      {option.CATEGORY}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <TextField
              value={addpanel.values.price}
              onChange={addpanel.handleChange}
              size="small"
              label="price"
              type="number"
              name="price"
              mt={10}
              variant="filled"
            />
            <Button
              size="small"
              variant="contained"
              type="submit"
              startIcon={<AddIcon />}
            >
              add
            </Button>
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
        <div className="main">{page}</div>
      </div>
    </>
  )
}
