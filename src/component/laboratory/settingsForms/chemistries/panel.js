import React from 'react';
import  Bloodglucose from './bloodglucose';
import Cardiac from './cardiac';
import Lipid from './lipid';
import LiverFunctionTest from './liver';
import RenalFunctionTest from './renal';
import SidebarChemistryPanel from './sidbar';


export default function ChemistryPanel() {
    return (
        <div className="container d-flex">
                <aside className="col-3">
                    <SidebarChemistryPanel/>
                </aside>
                <main>
                <Bloodglucose/>
                <Cardiac/>
                <Lipid/>
                <LiverFunctionTest/>
                <RenalFunctionTest/>
                </main>
        </div>
    )
}
