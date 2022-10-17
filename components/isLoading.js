import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Typography } from "@mui/material";

export default  function ISLOADING() {
 return (
  <>
   <div className="d-flex justify-content-center align-items-center bg-white ">
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ color: '#00224F' }}>
     <Typography variant="h5" sx={{ mb: 4 }} className="text-center">LOADING..........</Typography>
    </div>
   </div>
  </>
 );
};