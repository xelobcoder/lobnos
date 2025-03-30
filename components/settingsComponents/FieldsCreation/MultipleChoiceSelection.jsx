import { Add, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import styles from './MultipleChoiceSelection.module.css';

export default function MultipleChoiceSelectiionTestPanelCreation({ defaultOptions = [], field, setField }) {
	const [options, setOptions] = useState(defaultOptions);
	const [editing, setEditing] = useState("");
	const [editIndex, setEditIndex] = useState(null);
	const [checked, setChecked] = useState([]);

	useEffect(() => {
		if (typeof defaultOptions === "string" && defaultOptions.includes(",")) {
			const toArrayDefaultOptions = defaultOptions.split(",");
			setOptions(toArrayDefaultOptions);
		}
	}, [defaultOptions]);

	const handleAddOption = () => {
		const trimmedEditing = editing.trim();
		if (trimmedEditing === "" || !Array.isArray(options)) return;
		const isDuplicate = options.some(option => option.toLowerCase() === trimmedEditing.toLowerCase());
		if (isDuplicate) {
			alert("Option already exists");
			return;
		}
		let valueToUpdate = [];
		if (editIndex !== null) {
			const updatedOptions = options.map((option, index) =>
				index === editIndex ? trimmedEditing : option
			);
			valueToUpdate = updatedOptions;
		} else {
			valueToUpdate = [...options, trimmedEditing];
		}
		setEditing("");
		updateFields(valueToUpdate);
		setOptions(valueToUpdate);
		setEditIndex(null);
	};

	function updateFields(options) {
		if (options.length === 0) return;
		if (options.length === 1) {
			setField({ ...field, options: options[0] });
		} else {
			setField({ ...field, options: options.join(",") });
		}
	}

	const handleEditOption = (index) => {
		setEditing(options[index]);
		setEditIndex(index);
		window.scrollTo(0, 0);
	};

	const handleDeleteSelectedOptions = () => {
		const updatedOptions = options.filter((_, index) => !checked.includes(index));
		setOptions(updatedOptions);
		updateFields(updatedOptions);
		setChecked([]);
	};

	const handleCheckboxChange = (index) => {
		setChecked(prevChecked =>
			prevChecked.includes(index)
				? prevChecked.filter(i => i !== index)
				: [...prevChecked, index]
		);
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h3 className={styles.title}>Multiple Selection Options</h3>
				{checked.length > 0 && (
					<button 
						className={styles.iconButton}
						onClick={handleDeleteSelectedOptions}
						title="Delete selected options"
					>
						<Delete fontSize="small" />
					</button>
				)}
			</div>

			<div className={styles.inputGroup}>
				<input
					className={styles.input}
					value={editing}
					onChange={(ev) => setEditing(ev.target.value)}
					placeholder="Enter option text"
				/>
				<button
					onClick={handleAddOption}
					className={`${styles.iconButton} ${styles.addButton}`}
					title={editIndex !== null ? 'Update option' : 'Add option'}
				>
					<Add fontSize="small" />
				</button>
			</div>

			<div className={styles.optionsList}>
				{options.length > 0 ? options.map((item, index) => (
					<div key={index} className={styles.optionItem}>
						<div className={styles.optionContent}>
							<input
								type="checkbox"
								checked={checked.includes(index)}
								onChange={() => handleCheckboxChange(index)}
								className={styles.checkbox}
							/>
							<span className={styles.optionText}>{item}</span>
						</div>
						<button 
							onClick={() => handleEditOption(index)} 
							className={`${styles.iconButton} ${styles.editButton}`}
							title="Edit option"
						>
							<Edit fontSize="small" />
						</button>
					</div>
				)) : (
					<div className={styles.emptyState}>No options added yet</div>
				)}
			</div>
		</div>
	);
}
