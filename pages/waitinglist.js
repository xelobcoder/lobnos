/* eslint-disable react/jsx-key */
import {
 Table,
 FormControl,
 TableCell,
 Checkbox,
 TableRow,
 TableBody,
 TableHead,
 TableContainer,
 TableSortLabel,
 Input,
} from '@mui/material'
import Paper from '@mui/material/Paper'
import { useMemo, useState } from 'react'
import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header'

export default function WaitingList(props) {
 const [parentCheckbox, setParentCheckbox] = useState(false)
 const [selected, setSelected] = useState([])

 console.log(props.data)
 const column = [
  {
   Header: 'ID',
   accessor: 'id',
  },
  {
   Header: 'Name',
   accessor: 'name',
  },
  {
   Header: 'Email',
   accessor: 'email',
  },
  {
   Header: 'Phone',
   accessor: 'phone',
  },
 ]

 var rowHandler = (e, row) => { }
 const handleCheck = (e, row) => {
  if (e.target.checked) {
   console.log(row)
  }
 }

 const columndata = useMemo(() => column, [column])
 const data = useMemo(() => props.data, [props.data])
 return (
  <>
   <TableContainer component={Paper}>
    <Table size="small" aria-label="dense table" stickyHeader={true}>
     <TableHead >
      <TableRow
       selected={true}
       sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      >
       <TableCell>
        <Checkbox />
       </TableCell>

       {columndata.map((item, index) => {
        return (
         <TableCell sortDirection={'asc'} key={index}>
          <TableSortLabel>{item.Header}</TableSortLabel>
         </TableCell>
        )
       })}
      </TableRow>
     </TableHead>
     <TableBody>
      {data.map((row, index) => {
       return (
        <TableRow
         dataid={row.id}
         key={index}
         onClick={(e) => rowHandler(e, row)}
        >
         <TableCell>
          <Checkbox data-id={row.id} onClick={(e) => handleCheck(e, row)} />
         </TableCell>
         {columndata.map((item, index) => {
          return (
           <TableCell key={index}>{row[item.accessor]}</TableCell>
          )
         })}
        </TableRow>
       )
      })}
     </TableBody>
    </Table>
   </TableContainer>
  </>
 )
}

export async function getServerSideProps() {
 const res = await fetch('http://localhost:3000/api/org')
 const data = await res.json()
 return { props: { data } }
}

WaitingList.getLayout = (page) => {
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
