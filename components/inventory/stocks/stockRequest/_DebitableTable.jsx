import { PlayDisabledSharp } from '@mui/icons-material';
import {Table,TableBody,TableContainer,TableHead,TableRow,Paper,TableCell} from '@mui/material';
export default function DebitableBrandBatch({ data,disabled}) {
   return (
      <>
 <TableContainer component={Paper}>
      <Table>
        <TableHead className='bg-warning'>
         <TableRow>
            <TableCell>Brand</TableCell>
            <TableCell>Batch Number</TableCell>
            <TableCell>Store Qty</TableCell>
            <TableCell>Available Qty</TableCell>
            <TableCell>Current Qty</TableCell>
            <TableCell>Amount served</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.brand}</TableCell>
                <TableCell>{row.batchnumber}</TableCell>
                <TableCell>{row.storeQty}</TableCell>
                <TableCell>{row.availableQty}</TableCell>
                <TableCell>{row.currentQty}</TableCell>
                <TableCell>
                   <input disabled={disabled} className='custom-input' value={row.served} />
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </>
   )
} 