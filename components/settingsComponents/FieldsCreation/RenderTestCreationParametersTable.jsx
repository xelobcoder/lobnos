import React from 'react';
import { Edit, Remove } from '@mui/icons-material';
import ReformatTestParamOptions from './FormatOptions';
import FormatPlainOptionsUsePlain from './formatPlainOptions';


export default function RenderTestCreationParameters({ data, reorder, setReorder, changeOrdering, editField, removeField }) {
    const handleReorderClick = () => setReorder(!reorder);

    const renderTableData = (item, index) => (
        <tr key={index}>
            <td>{item.name}</td>
            <td>{item.upperlimit}</td>
            <td>{item.lowerlimit}</td>
            <td>{item.male ? item.male.upperlimit : ""}</td>
            <td>{item.male ? item.male.lowerlimit : ""}</td>
            <td>{item.female ? item.female.upperlimit : ""}</td>
            <td>{item.female ? item.female.lowerlimit : ""}</td>
            <td className="table-column-width-reset">
                {item.options ? <ReformatTestParamOptions stringdata={item.options} /> : ""}
            </td>
            <td className="table-column-width-reset">
                {item.useplain ? <FormatPlainOptionsUsePlain plaindata={item.plain} /> : ""}
            </td>
            <td>
                <div className="d-flex">
                    <input
                        type="number"
                        className="custom-input col-2"
                        value={item.ordering}
                        disabled={reorder}
                        onChange={(ev) => changeOrdering(item, ev)}
                    />
                    <button
                        title="Edit Parameter"
                        onClick={() => editField(item)}
                        className="btn btn-info mx-2"
                    >
                        <Edit />
                    </button>
                    <button
                        title="Remove Parameter"
                        onClick={() => removeField(item)}
                        className="btn btn-danger"
                    >
                        <Remove />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <table className="table table-bordered table-striped my-5">
            <thead className="table-secondary">
                <tr>
                    <th>
                        <button onClick={handleReorderClick} className="btn btn-link">
                            Reorder Fields
                        </button>
                        <br />
                        Parameter Name
                    </th>
                    <th>General <br /> Upper Limits</th>
                    <th>General <br /> Lower Limits</th>
                    <th>Male <br /> Upper Limits</th>
                    <th>Male <br /> Lower Limits</th>
                    <th>Female <br /> Upper Limits</th>
                    <th>Female <br /> Lower Limits</th>
                    <th>Options</th>
                    <th>Plain</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => renderTableData(item, index))}
            </tbody>
        </table>
    );
}
