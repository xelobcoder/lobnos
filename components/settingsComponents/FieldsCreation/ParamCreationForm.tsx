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

    const inputTypes = [
        { value: 'options', label: 'Dropdown List' },
        { value: 'input', label: 'Single Line' },
        { value: 'textReference', label: 'Text with Ref' },
        { value: 'limits', label: 'Numeric Range' },
        { value: 'greaterLess', label: 'Greater Than / Less Than Value' },
        { value: 'plain', label: 'Text Area' },
        { value: 'ultrasoundFields', label: 'Ultrasound Fields' },
    ];

    const handleTypeSelect = (value: string | null) => {
        if (value === null) {
            const updatedField = handleCreationMasterRUle({ target: { value: null } }, field);
            setField(updatedField);
            return;
        }
        const ev = { target: { value } };
        const updatedField = handleCreationMasterRUle(ev, field);
        setField(updatedField);
    };

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
                    value={inputTypes.find(option => option.value === field?.plan) || null}
                    onChange={(selectedOption) => handleTypeSelect(selectedOption?.value || null)}
                    placeholder="Select input type"
                    isClearable
                    classNamePrefix="select"
                />
            </div>

            <div className="form-check mb-3">
                <input
                    type="checkbox"
                    id="hasUnits"
                    checked={!!field?.hasunits || (field?.units && field.units.toString().length > 0)}
                    onChange={(e) => setField({ ...field, hasunits: e.target.checked, units: e.target.checked ? field.units : '' })}
                    className="form-check-input"
                />
                <label className="form-check-label pls-label" htmlFor="hasUnits">
                    Has Units
                </label>
            </div>

            {(!!field?.hasunits || (field?.units && field.units.toString().length > 0)) && (
                <div className="mb-3">
                    <label htmlFor="unitsInput">Units</label>
                    <input
                        id="unitsInput"
                        type="text"
                        onChange={(ev) => {
                            const newUnits = ev.target.value;
                            setField({ ...field, units: newUnits, hasunits: newUnits.length > 0 });
                        }}
                        value={field?.units || ''}
                        placeholder="Specify units (e.g., mg/dL)"
                        className="form-control"
                    />
                </div>
            )}

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
                        onChange={(selectedOption) => setField({ ...field, categoryid: selectedOption?.value || null })}
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
        </div>
    );
}