import UnitCatalogueSelect from './UnitCatalogueSelect';
import {parameterDefinition,resultTypes,referenceModes,withDefinition} from '../../../lib/parameterDefinition';
import dynamic from "next/dynamic";
import { handleChangeWithState, reactSelectCustomStyles } from "../../Auth/customFetch";
import { handleCreationMasterRUle } from "./data/testUtil";

const Select: any = dynamic(() => import("react-select"), { ssr: false });

interface Category {
    categoryid: string;
    categoryname: string;
}

export default function ParamCreationGForm({ field, setField, fieldConstraintsCategorization }: {
    field: any;
    setField: (field: any) => void;
    fieldConstraintsCategorization: Category[];
}) {
    const categoryOptions = fieldConstraintsCategorization?.map(cat => ({
        value: cat.categoryid,
        label: cat.categoryname
    })) || [];

    const inputTypes = resultTypes.map(([value,label])=>({value,label}));

    const handleTypeSelect = (value:string|null) => setField(withDefinition(field,{result_type:value||''}));

    return (
        <div className="d-flex flex-column gap-3">
            <div className="mb-3">
                <label className="pls-label">Field Name</label>
                <input
                    type="text"
                    value={field?.name || ''}
                    placeholder="Enter field name"
                    onChange={(ev) => handleChangeWithState(ev, "name", setField, field)}
                    className="form-control"
                />
            </div>

            <div className="mb-3">
                <label className="pls-label">Input Type</label>
                <Select
                    options={inputTypes}
                    styles={reactSelectCustomStyles}
                    value={inputTypes.find(option => option.value === parameterDefinition(field).result_type) || null}
                    onChange={(selectedOption: {value: string; label: string} | null) => handleTypeSelect(selectedOption?.value || null)}
                    placeholder="Select input type"
                    isClearable
                    classNamePrefix="select"
                />
            </div>

            <div className="mb-3"><label className="form-label">Reference mode</label><select className="form-select" aria-label="Reference mode" value={parameterDefinition(field).reference_mode} onChange={e=>setField(withDefinition(field,{reference_mode:e.target.value}))}>{referenceModes(parameterDefinition(field).result_type).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
            <div className="mb-3"><label className="form-label">Units</label><UnitCatalogueSelect field={field} onChange={setField}/></div>

            <div className="form-check mb-3">
                <input
                    type="checkbox"
                    id="assignCategory"
                    checked={!!field?.undercategory}
                    onChange={(e) => setField({ ...field, undercategory: e.target.checked })}
                    className="form-check-input"
                />
                <label className="form-check-label pls-label" htmlFor="assignCategory">
                    Assign Category
                </label>
            </div>

            {field?.undercategory && (
                <div className="mb-3">
                    <label htmlFor="categorySelect">Category</label>
                    <Select
                        inputId="categorySelect"
                        options={categoryOptions}
                        styles={reactSelectCustomStyles}
                        value={categoryOptions.find(option => option.value === field?.categoryid) || null}
                        onChange={(selectedOption: {value: string | number; label: string} | null) => setField({ ...field, categoryid: selectedOption?.value || null })}
                        placeholder="Select a category"
                        isClearable
                        classNamePrefix="select"
                    />
                </div>
            )}

            {field?.plan === 'greaterLess' && (
                <div className="mb-3">
                    <label htmlFor="referenceValue">Enter &gt;value or &lt;value</label>
                    <input
                        id="referenceValue"
                        type="text"
                        value={field?.textReference || ''}
                        onChange={e => setField({ ...field, textReference: e.target.value })}
                        placeholder="e.g. >5 or <10"
                        className="form-control"
                    />
                </div>
            )}


            {field?.plan === 'greaterLessEqualTo' && (
                <div className="mb-3">
                    <label htmlFor="referenceValue">Enter &gt;value or &lt;value</label>
                    <input
                        id="referenceValue"
                        type="text"
                        value={field?.textReference || ''}
                        onChange={e => setField({ ...field, textReference: e.target.value })}
                        placeholder="e.g. >=5 or <=10"
                        className="form-control"
                    />
                </div>
            )}

            {/* time */}

            {
                field?.plan == "time" && (
                    <div className="mb-3">
                        <label htmlFor="timeFormat">Time Format</label>
                        <input
                            id="timeFormat"
                            type="text"
                            value={field?.textReference || ''}
                            onChange={e => setField({ ...field, textReference: e.target.value })}
                            placeholder="e.g. HH:mm:ss"
                            className="form-control"
                        />
                    </div>
                )
            }
        </div>
    );
}