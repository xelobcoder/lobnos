import {useRouter} from 'next/router';
import {Button} from '@mui/material';
function REJECTEDVIEW ({reverse,data}){
 const router = useRouter();
 return (
  <>
   <Button onClick={(e) => reverse()}>Rejected</Button>
  </>
 )
}


export default REJECTEDVIEW;