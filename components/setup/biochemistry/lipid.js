import React, { useState } from 'react';
import PARAMETER_DISPLAY_COMPONENT from '../parameterDisplay';
import lipidparams from './lipidparameters';

function LipidFunction_setup() {
    const [lipidparameters, setLipidparameters] = useState(lipidparams);
    return (
        <>
            <PARAMETER_DISPLAY_COMPONENT parameterdata={lipidparameters} category='LIPID_PROFILE_SETUP' />
        </>
    )
}


export default LipidFunction_setup;