export default function TextRReferenceOptions({ field, setField }) {
    return <div>
        <label>Reference</label>
        <textarea value={field.textReference} rows={3} className="form-control" onChange={(ev) => {
            setField({ ...field, 'textReference': ev.target.value })
        }} />
    </div>
}