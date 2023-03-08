import renalparameters from './renalparameters';
import { useState } from 'react';
import PARAMETER_DISPLAY_COMPONENT from '../parameterDisplay';

function RENAL_SETUP() {
	const [renalpanel,setRenalpanel] = useState(renalparameters)
	return (
		<>
			<PARAMETER_DISPLAY_COMPONENT parameterdata={renalpanel} category='RENAL_SETUP'/>
		</>
	)
}



export default RENAL_SETUP;