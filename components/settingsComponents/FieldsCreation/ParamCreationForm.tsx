import {
    RiCheckboxCircleFill,
    RiFileTextLine,
    RiFileTextFill,
    RiNumber5,
    RiFile2Line
} from '@remixicon/react';
import { handleChangeWithState, reactSelectCustomStyles } from "../../Auth/customFetch";
import { handleCreationMasterRUle } from "./data/testUtil";
import Select from 'react-select';
import styles from './ParamCreationForm.module.css';

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
        { value: 'options', label: 'Dropdown List', Icon: RiCheckboxCircleFill },
        { value: 'input', label: 'Single Line', Icon: RiFileTextLine },
        { value: 'textReference', label: 'Text with Ref', Icon: RiFileTextFill },
        { value: 'limits', label: 'Numeric Range', Icon: RiNumber5 },
        { value: 'greaterLess', label: 'Greater Than / Less Than Value', Icon: RiNumber5 },
        { value: 'plain', label: 'Text Area', Icon: RiFile2Line },
        { value: 'ultrasoundFields', label: 'ultrasound Fields', Icon: RiFileTextFill },
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
        <div className={styles.formBuilder}>
            <div className={styles.formSectionStatic}>
                <div className={styles.inputGroup}>
                    <label htmlFor="fieldName" className={styles.inputLabel}>Field Name</label>
                    <input
                        id="fieldName"
                        value={field?.name || ''}
                        placeholder="Enter field name"
                        onChange={(ev) => handleChangeWithState(ev, "name", setField, field)}
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Input Type</label>
                    <Select
                        options={inputTypes}
                        styles={reactSelectCustomStyles}
                        value={inputTypes.find(option => option.value === field?.plan) || null}
                        onChange={(selectedOption) => handleTypeSelect(selectedOption?.value || null)}
                        className={styles.inputTypeSelect}
                        placeholder="Select Input Type"
                        isClearable
                        formatOptionLabel={({ value, label, Icon }) => (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {Icon && <Icon style={{ marginRight: '8px' }} />}
                                {label}
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className={styles.formSectionScrollable}>
                <div className={styles.optionsGroup}>
                    <div className={styles.optionItem}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={field?.hasunits == 1 || field.hasunits == "1" || field.units.toString().length > 0}
                                onChange={(e) => setField({ ...field, hasunits: e.target.checked })}
                                className={styles.checkbox}
                            />
                            Has Units
                        </label>
                    </div>

                    {field?.hasunits && (
                        <div className={styles.inputGroup}>
                            <input
                                onChange={(ev) => handleChangeWithState(ev, "units", setField, field)}
                                value={field?.units || ''}
                                placeholder="Specify units (e.g., mg/dL)"
                                className={styles.formInput}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.optionsGroup}>
                    <div className={styles.optionItem}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={!!field?.undercategory}
                                onChange={(e) => setField({ ...field, undercategory: e.target.checked })}
                                className={styles.checkbox}
                            />
                            Assign Category
                        </label>
                    </div>

                    {field?.undercategory ? (
                        <div className={styles.inputGroup}>
                            <Select
                                options={categoryOptions}
                                styles={reactSelectCustomStyles}
                                value={categoryOptions.find(option => option.value === field?.categoryid) || null}
                                onChange={(selectedOption) => setField({ ...field, categoryid: selectedOption?.value || null })}
                                className={styles.categorySelect}
                                placeholder="Select a category"
                                isClearable
                            />
                        </div>
                    ) : null}
                </div>

                {field?.plan === 'greaterLess' && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Enter &gt;value or &lt;value</label>
                        <input
                            type="text"
                            value={field?.textReference || ''}
                            onChange={e => setField({ ...field, textReference: e.target.value })}
                            placeholder="e.g. >5 or <10"
                            className={styles.formInput}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}