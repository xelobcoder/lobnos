import { TextField, Container } from "@mui/material";


export default function Message({content, onMessage }) {
 return (
  <>
   <textarea value={content}  onChange={(e) =>onMessage(e)} id='phelo-textarea' placeholder='type something here'>

   </textarea>
  </>
 )
}