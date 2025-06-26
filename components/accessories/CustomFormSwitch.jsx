import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function CustomFormSwitch({ title, target, update, text, value, variant = "boolean" }) {
	const [state, setState] = useState(true);

	const handleChange = (ev, target) => {
		setState(ev.target.checked);
		if (variant === "number") {
			update(target, ev.target.checked ? 1 : 0);
		} else if (variant === "string") {
			update(target, ev.target.checked ? "Yes" : "No");
		} else {
			update(target, ev.target.checked);
		}
	};

	useEffect(() => {
		if (variant === "number") {
			setState(value === 1);
		} else if (variant === "string") {
			setState(value === "Yes");
		} else {
			setState(value);
		}
	}, [variant, value]);

	return (
		<div className="card mt-3">
			<div className="card-header  d-flex align-items-center">
				<Form.Check
					checked={state}
					onChange={(ev) => handleChange(ev, target)}
					type="switch"
					className="me-3"
				/>
				<h6 className="fw-bold mb-0 text-capitalize flex-grow-1">{title}</h6>
			</div>
			<div className="card-body text-secondary">
				<p className="mb-0 pls-color fs-6">{text}</p>
			</div>
		</div>
	);
}
