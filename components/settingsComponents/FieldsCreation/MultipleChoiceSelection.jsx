import { Add, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";

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
		<div>
			<div className="p-2 pointer">
				<strong className="my-3" style={{ textDecoration: "underline" }}>
					<em>Multiple selection/dropdown</em>
				</strong>
				<Delete
					titleAccess="Delete selected options"
					color="error"
					onClick={handleDeleteSelectedOptions}
				/>
			</div>
			<div>
				<input
					className="custom-input col-3 my-2"
					value={editing}
					onChange={(ev) => setEditing(ev.target.value)}
				/>
				<button
					onClick={handleAddOption}
					className="mx-2 btn btn-secondary"
				>
					<Add />
				</button>
			</div>
			<div className="list-group">
				{options.length > 0 && options.map((item, index) => (
					<div key={index} className="d-flex align-items-center justify-content-between list-group-item">
						<div className="d-flex align-items-center">
							<input
								type="checkbox"
								className="form-check-input me-2"
								checked={checked.includes(index)}
								onChange={() => handleCheckboxChange(index)}
							/>
							<p className="mb-0 text-uppercase">{item}</p>
						</div>
						<button onClick={() => handleEditOption(index)} className="mx-2 btn btn-primary btn-sm">
							Edit
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
