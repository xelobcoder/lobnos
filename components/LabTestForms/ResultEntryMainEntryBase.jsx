import ResultEntryHtmlGenerator from "../Auth/ResultEntryHtmlGenerator";
import CommentSection from "./commentSection";
import ResultEntryDrugsForm from "./ResultEntryDrugsForm";


export default function ResultEntryMainEntryBase({ handlestate, handleCreateFields, rule = [], setPin, pin, handleSubmit, setComments, comments, handleComments, isPinUsed, hasDrugs, setModifiedDrugs, ascensionid, testid, isloading, isPinShared }) {
	return (
		<section>
			<div className="table-responsive my-2">
				<table theme='dark' className="table billing-cart-table table-bordered table-sm" style={{ fontSize: '12px', fontFamily: 'Cambria, serif', backgroundColor: 'var(--theme-card-bg)', color: 'var(--bs-body-color)' }}>
					<thead className="text-sm" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>
						<tr>
							<th className="fw-bold text-capitalize text-sm" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Parameter</th>
							<th className="fw-bold text-capitalize text-sm" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Value</th>
							<th className="fw-bold text-capitalize text-sm" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Unit</th>
							<th className="fw-bold text-capitalize text-sm" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Reference</th>
							<th className="fw-bold text-capitalize text-sm d-none d-md-table-cell" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Mode</th>
							<th className="fw-bold text-capitalize text-sm d-none d-md-table-cell" style={{ backgroundColor: 'var(--bs-tertiary-bg)', color: 'var(--bs-body-color)' }}>Constraints</th>
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
							className="custom-input form-control"
							type="password"
							placeholder={isPinShared ? "Using shared PIN" : "Enter pin here"}
							style={{ fontSize: '0.85rem', height: 28, padding: '2px 6px', backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
							value={pin} disabled={isPinShared}
							autoComplete="off"
							autoCorrect="off"
							onChange={e => setPin(e.target.value)}
						/>
					</div>
				)}
				<div>
					<button onClick={handleSubmit} className="btn btn-primary btn-sm my-2 mx-1" disabled={isloading}>
						{isloading ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</div>
		</section>
	);
}
