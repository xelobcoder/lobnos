import { TextField,Container} from "@mui/material";


export default function Message({onMessage,defaultvalue,}) {
 return (
  <>
   <Container>
    <TextField  value={defaultvalue} onChange={(e) => onMessage(e)}/>
   </Container>
  </>
 )
}