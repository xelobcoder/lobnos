import React from 'react';
import ReformatTestParamOptions from './FormatOptions';


export default function RenderTestCreationParameters({ data, reorder, setReorder, changeOrdering, editField, removeField }) {
    const handleReorderClick = () => setReorder(!reorder);

    const renderTableData = (item, index) => (
        <tr key={index}>
            <td className='text-sm'>{item.name}</td>
            <td className='text-sm'>{item.upperlimit}</td>
            <td className='text-sm'>{item.lowerlimit}</td>
            <td className='text-sm'>{item.male ? item.male.upperlimit : ""}</td>
            <td className='text-sm'>{item.male ? item.male.lowerlimit : ""}</td>
            <td className='text-sm'>{item.female ? item.female.upperlimit : ""}</td>
            <td className='text-sm'>{item.female ? item.female.lowerlimit : ""}</td>
            <td className='text-sm'>{item.valueAlert}</td>
            <td  className="table-column-width-reset">
                {item.options ? <ReformatTestParamOptions stringdata={item.options} /> : ""}
            </td>
            <td  className="table-column-width-reset">
                {item.textReference ? <ReformatTestParamOptions stringdata={item.textReference} /> : ""}
            </td>
            <td className='text-sm'>
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
                        className="btn btn-info mx-2 btn-sm text-capitalize"
                    >
                        Edit
                    </button>
                    <button
                        title="Remove Parameter"
                        onClick={() => removeField(item)}
                        className="btn btn-danger btn-sm text-capitalize"
                    >
                        delete
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <>
            <button onClick={handleReorderClick} className="btn btn-link">
                Reorder Fields
            </button>
            <table className="table billing-cart-table table-hover pointer">
                <thead >
                    <tr>
                        <th>Parameter Name</th>
                        <th>GUL</th>
                        <th>GLL</th>
                        <th>MUL</th>
                        <th>MLL</th>
                        <th>FUL</th>
                        <th>FLL</th>
                        <th>AlertValue</th>
                        <th>Options</th>
                        <th>Plain</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => renderTableData(item, index))}
                </tbody>
            </table></>
    );
}
