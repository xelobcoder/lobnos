import React from 'react'
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
export default function EMPTY_TABLE_TEMPLATE(col) {
 return (
  <tr>
   <td colSpan={col} className='text-center'>
    <TextSnippetIcon color='primary' fontSize='large'></TextSnippetIcon>
    <h4>No data found</h4>
   </td>
  </tr>
 )
}
