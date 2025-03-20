import React from 'react';
import ReformatTestParamOptions from './FormatOptions';
import styles from '../../../styles/SmsTemplateList.module.css'


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
            <td className="table-column-width-reset">
                {item.options ? <ReformatTestParamOptions stringdata={item.options} /> : ""}
            </td>
            <td className="table-column-width-reset">
                {item.textReference ? <ReformatTestParamOptions stringdata={item.textReference} /> : ""}
            </td>
            <td>
                {item.options === "ultrasoundFields" ? 'Yes' : 'No'}
            </td>
            <td className='text-sm'>
                <div className="d-flex">
                    <input
                        type="number"
                        className="custom-input "
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
        <div>
            <div className='d-flex justify-content-end'>
                <button onClick={handleReorderClick} className="btn btn-link pls-label ">
                    Reorder Fields
                </button>
            </div>
            <table className={`${styles.table} text-sm `}>
                <thead >
                    <tr className='pls-label text-sm'>
                        <th className='pls-label  bg-secondary-subtle'>Parameter Name</th>
                        <th className='pls-label  bg-secondary-subtle'>GUL</th>
                        <th className='pls-label  bg-secondary-subtle'>GLL</th>
                        <th className='pls-label  bg-secondary-subtle'>MUL</th>
                        <th className='pls-label  bg-secondary-subtle'>MLL</th>
                        <th className='pls-label  bg-secondary-subtle'>FUL</th>
                        <th className='pls-label  bg-secondary-subtle'>FLL</th>
                        <th className='pls-label  bg-secondary-subtle'>AlertValue</th>
                        <th className='pls-label  bg-secondary-subtle'>Options</th>
                        <th className='pls-label  bg-secondary-subtle'>Plain</th>
                        <th className='pls-label  bg-secondary-subtle'>Ultrasound Type</th>
                        <th className='pls-label  bg-secondary-subtle'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(data) && data.length > 0 && data.map((item, index) => renderTableData(item, index))}
                </tbody>
            </table>
        </div>
    );
}
