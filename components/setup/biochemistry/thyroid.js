import { useState } from "react";
import PARAMETER_DISPLAY_COMPONENT from "../parameterDisplay";
import paramater from './thyroidparameter';

export default function THYROID_SETUP() {
 const [thyroidparameter,setThyroidParameter] = useState(paramater)
 return (
  <>
    <PARAMETER_DISPLAY_COMPONENT parameterdata={thyroidparameter} category='THYROID_SETUP'/>
  </>
 )
}
