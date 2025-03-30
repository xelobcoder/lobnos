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

export default function ParamCreationGForm({ field, setField, generalTestRule, fieldConstraintsCategorization }: {
    field: any;
    setField: (field: any) => void;
    generalTestRule: any;
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
        { value: 'plain', label: 'Text Area', Icon: RiFile2Line },
    ];

    const handleTypeSelect = (value) => {
        const ev = { target: { value } };
        const updatedField = handleCreationMasterRUle(ev, field);
        setField(updatedField);
    };

    return (
        <div className={styles.formBuilder}>
            <div className={styles.formSection}>
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Field Name</label>
                    <input
                        value={field?.name}
                        placeholder="Enter field name"
                        onChange={(ev) => handleChangeWithState(ev, "name", setField, field)}
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Input Type</label>
                    <div className={styles.typeGrid}>
                        {inputTypes.map((type) => {
                            const IconComponent = type.Icon;
                            return (
                                <div
                                    key={type.value}
                                    className={`${styles.typeBox} ${field.plan === type.value ? styles.selected : ''}`}
                                    onClick={() => handleTypeSelect(type.value)}
                                >
                                    <IconComponent size={24} className={styles.icon} />
                                    <span>{type.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.optionsGroup}>
                    <div className={styles.optionItem}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={field.hasunits}
                                onChange={(e) => setField({ ...field, hasunits: e.target.checked })}
                                className={styles.checkbox}
                            />
                            Has Units
                        </label>
                    </div>

                    {field.hasunits && (
                        <div className={styles.inputGroup}>
                            <input
                                onChange={(ev) => handleChangeWithState(ev, "units", setField, field)}
                                value={field.units}
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
                                checked={field.undercategory}
                                onChange={(e) => setField({ ...field, undercategory: e.target.checked })}
                                className={styles.checkbox}
                            />
                            Assign Category
                        </label>
                    </div>

                    {field.undercategory && (
                        <div className={styles.inputGroup}>
                            <Select
                                options={categoryOptions}
                                styles={reactSelectCustomStyles}
                                value={categoryOptions.find(option => option.value === field.categoryid) || null}
                                onChange={(selectedOption) => setField({ ...field, categoryid: selectedOption?.value || null })}
                                className={styles.categorySelect}
                                placeholder="Select a category"
                                isClearable
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
