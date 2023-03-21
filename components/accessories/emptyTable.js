import React from 'react'
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
export default function EMPTY_TABLE_TEMPLATE(col) {
 return (
  <tr>
   <td colSpan={col} style={{ width: '100%' }} >
    <TextSnippetIcon color='primary' fontSize='large'></TextSnippetIcon>
    <h4>No data found</h4>
   </td>
  </tr>
 )
}
