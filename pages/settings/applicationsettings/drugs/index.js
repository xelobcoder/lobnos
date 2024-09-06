import React, { useState } from 'react';
import MainSettingsLayoutView from '../../../../components/settingsComponents/MainSettingsLayoutView';
import AddNewDrugFormPLSMASTER from '../../../../components/Drugs/NewDrugFormComponent';
import DrugsListPLSMASTER from '../../../../components/Drugs/DrugsListComponent';

const defaultEditData = { editid: null, category: null, editing: false, drugName: null}



export default function PLSDRUGSMASTERLISS() {
    const [editing, setEditing] = useState(defaultEditData);

    const handleEditDrug = (data) => {
        const { id, category,drug ,categoryid} = data;
        setEditing({ editing: true, editid: id,drugName:drug,category:categoryid})
    }

    const resetEditDrug = (data) => {
        setEditing(defaultEditData);
    }

    return (
        <MainSettingsLayoutView>
            <div className="p-2">
                <h5 className='heightedBorder bg-body-secondary p-2'>Drug Management</h5>
                <hr/>
                <AddNewDrugFormPLSMASTER editing={editing} />
                <hr/>
                <DrugsListPLSMASTER resetEditDrug={resetEditDrug} handleEditDrug={handleEditDrug} />
            </div>
        </MainSettingsLayoutView>
    );
}
