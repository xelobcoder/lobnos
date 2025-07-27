import ResultEntryHtmlGenerator from "../Auth/ResultEntryHtmlGenerator";
import CommentSection from "./commentSection";
import ResultEntryDrugsForm from "./ResultEntryDrugsForm";
import { toast } from 'react-toastify';
import { useState } from "react";
import { useApplication } from "../Auth/useApplicationContext";
import { validatePin } from "../Auth/customFetch";


export default function ResultEntryMainEntryBase({ handlestate, handleCreateFields, rule = [], handleSubmit, setComments, comments, handleComments, isPinUsed, hasDrugs, setModifiedDrugs, ascensionid, testid, isloading }) {
	const [pin, setPin] = useState("");
	const employeeid = useApplication()?.user?.employeeid;

	const handleSave = async () => {
		if (!pin) return toast.warn("PIN is required");
		const response = await validatePin(employeeid, pin);
		console.log(response,'PIN Response');
		if (!response == true) return toast.error(response?.message || "Invalid PIN");
		else {
			handleSubmit();
		}

	};

	return (
		<section>
			<div className="table-responsive my-2">
				<table theme='dark' className="table billing-cart-table table-bordered table-sm" style={{ fontSize: '12px', maxWidth: 650, margin: '0 auto', fontFamily: 'Cambria, serif' }}>
					<thead className="text-sm">
						<tr>
							<th className="fw-bold text-capitalize text-sm">Parameter</th>
							<th className="fw-bold text-capitalize text-sm">Value</th>
							<th className="fw-bold text-capitalize text-sm">Unit</th>
							<th className="fw-bold text-capitalize text-sm">Reference</th>
							<th className="fw-bold text-capitalize text-sm d-none d-md-table-cell">Mode</th>
							<th className="fw-bold text-capitalize text-sm d-none d-md-table-cell">Constraints</th>
						</tr>
					</thead>
					<tbody>
						{rule.length > 0 ? rule.map((item, index) => {
							return <ResultEntryHtmlGenerator key={index} statehandler={handlestate} index={index} item={item} />
						}) :
							<tr>
								<td className="text-danger p-3" colSpan={6}>
									No data found. Ensure fields were created.
									<button onClick={handleCreateFields} className="btn btn-outline-primary btn-sm border-2">Create fields</button>
								</td>
							</tr>}
					</tbody>
				</table>
			</div>
			{hasDrugs && <ResultEntryDrugsForm ascensionid={ascensionid} testid={testid} setModifiedDrugs={setModifiedDrugs} />}
			<CommentSection datafunction={setComments} getcomment={handleComments} datasource={comments} target={'comments'} value={comments.comments} />
			<div className="d-flex flex-column flex-md-row justify-content-between mt-2">
				{isPinUsed && (
					<div className="mb-2 mb-md-0">
						<input
							className="custom-input"
							type="password"
							placeholder="Enter pin here"
							style={{ fontSize: '0.85rem', height: 28, padding: '2px 6px' }}
							value={pin}
							autoComplete="off"
							autoCorrect="off"
							onChange={e => setPin(e.target.value)}
						/>
					</div>
				)}
				<div>
					<button onClick={handleSave} className="btn btn-primary btn-sm my-2 mx-1" disabled={isloading}>
						{isloading ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</div>
		</section>
	);
}
