import { useEffect, useId, useRef, useState } from 'react';
import { customFetch, customPost } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';

const normalize = value => value.trim().replace(/\s+/g, ' ');

export default function DrugForm({ editing, onSaved, onCancel }) {
    const { applicationsettings } = useApplicationSettings();
    const employeeid = applicationsettings?.user?.employeeid;
    const uid = useId();
    const nameId = `${uid}-name`;
    const categoryId = `${uid}-category`;

    const [name, setName] = useState(editing.drugName || '');
    const [category, setCategory] = useState(String(editing.category || ''));
    const [categories, setCategories] = useState([]);
    const [pending, setPending] = useState([]);
    const nextPendingId = useRef(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [saving, setSaving] = useState(false);
    const lock = useRef(false);

    useEffect(() => {
        let live = true;
        customFetch('drugsCategory')
            .then(response => {
                if (!live) return;
                if (!Array.isArray(response)) throw Error(response?.message || 'Categories could not be loaded');
                setCategories(response);
                if (!editing.editing) {
                    const antibiotics = response.find(row => row.categoryName?.trim().toLowerCase() === 'antibiotics');
                    if (antibiotics) setCategory(current => current || String(antibiotics.id));
                }
            })
            .catch(failure => {
                if (live) setLoadError(failure.message);
            })
            .finally(() => {
                if (live) setLoading(false);
            });
        return () => { live = false; };
    }, [revision, editing.editing]);

    function reloadCategories() {
        setLoading(true);
        setLoadError('');
        setRevision(value => value + 1);
    }

    function categoryName(id) {
        return categories.find(row => Number(row.id) === id)?.categoryName || 'Category';
    }

    function stageDrug(event) {
        event.preventDefault();
        const drug = normalize(name);
        const categoryValue = Number(category);
        if (!drug || drug.length > 255 || !Number.isSafeInteger(categoryValue) || categoryValue < 1) {
            setError('Enter a drug name and choose a category.');
            return;
        }
        if (pending.length >= 100) {
            setError('Save this batch before adding more than 100 drugs.');
            return;
        }
        if (!categories.some(row => Number(row.id) === categoryValue)) {
            setError('Choose a valid drug category.');
            return;
        }
        if (pending.some(item => item.category === categoryValue &&
            item.drug.toLowerCase() === drug.toLowerCase())) {
            setError('This drug is already in the pending list for that category.');
            return;
        }

        setPending(current => [...current, {
            id: nextPendingId.current++,
            drug,
            category: categoryValue,
        }]);
        setName('');
        setError('');
    }

    async function save(event) {
        event?.preventDefault();
        if (lock.current || loading || loadError) return;
        if (!employeeid) {
            setError('Your signed-in employee could not be identified. Reload your session before saving.');
            return;
        }

        if (editing.editing) {
            const drug = normalize(name);
            const categoryValue = Number(category);
            if (!drug || drug.length > 255 || !Number.isSafeInteger(categoryValue) || categoryValue < 1) {
                setError('Enter a valid drug name and category.');
                return;
            }
        } else if (!pending.length) {
            setError('Add at least one drug to the pending list before saving.');
            return;
        }

        lock.current = true;
        setSaving(true);
        setError('');
        try {
            const response = editing.editing
                ? await customPost('drugs', 'PUT', {
                    drug: normalize(name),
                    category: Number(category),
                    createdBy: employeeid,
                    id: editing.editid,
                })
                : await customPost('drugs/bulk', 'POST', {
                    drugs: pending.map(({ drug, category }) => ({ drug, category })),
                    createdBy: employeeid,
                });
            if (response?.status !== true) throw Error(response?.message || response?.error || 'Drug changes were not saved');
            const savedCount = editing.editing ? 1 : pending.length;
            setPending([]);
            setName('');
            onSaved?.(savedCount);
        } catch (failure) {
            setError(failure.message || 'Drug changes were not saved. Your entries have been retained.');
        } finally {
            lock.current = false;
            setSaving(false);
        }
    }

    const isEditing = !!editing.editing;
    const busy = saving || loading || !!loadError;

    return <form onSubmit={isEditing ? save : stageDrug} className="card border-0 shadow-sm" noValidate={false}>
        <div className="card-header bg-body border-bottom py-3 px-3 px-md-4">
            <h2 className="h5 mb-1">{isEditing ? 'Edit drug' : 'New drugs'}</h2>
            <p className="text-body-secondary small mb-0">
                {isEditing
                    ? 'Update the drug’s name or category.'
                    : 'Add drugs one at a time, then save them together.'}
            </p>
        </div>

        <div className="card-body px-3 px-md-4">
            {loadError && <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 py-2" role="alert">
                <span>{loadError}</span>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={reloadCategories}>
                    Retry
                </button>
            </div>}
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

            <fieldset className="border-0 p-0 m-0" disabled={busy}>
                <div className="row g-3 align-items-end">
                    <div className={isEditing ? 'col-12 col-md-6' : 'col-12 col-md-5'}>
                        <label htmlFor={nameId} className="form-label fw-medium">Drug name</label>
                        <input
                            id={nameId}
                            className="form-control"
                            required
                            maxLength={255}
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="e.g. Ampicillin"
                            autoComplete="off"
                        />
                    </div>
                    <div className={isEditing ? 'col-12 col-md-6' : 'col-12 col-md-5'}>
                        <label htmlFor={categoryId} className="form-label fw-medium">Category</label>
                        <div className="input-group">
                            <select
                                id={categoryId}
                                className="form-select"
                                required
                                value={category}
                                onChange={event => setCategory(event.target.value)}
                            >
                                <option value="">{loading ? 'Loading categories…' : 'Choose a category'}</option>
                                {category && !categories.some(row => String(row.id) === category) &&
                                    <option value={category}>Current category (#{category})</option>}
                                {categories.map(row => <option key={row.id} value={row.id}>{row.categoryName}</option>)}
                            </select>
                            {!isEditing && <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={reloadCategories}
                                title="Reload the category list"
                            >Refresh</button>}
                        </div>
                    </div>
                    {!isEditing && <div className="col-12 col-md-2">
                        <button type="submit" className="btn btn-outline-primary w-100">Add to list</button>
                    </div>}
                </div>

                {!isEditing && <>
                    <div className="form-text mt-2">
                        Missing a category?{' '}
                        <a href="/settings/applicationsettings/drugs/drugCategoryView" target="_blank" rel="noreferrer">
                            Manage categories
                        </a>
                    </div>
                    {!loading && !loadError && !categories.length && <div className="alert alert-warning py-2 mt-3 mb-0" role="status">
                        No categories yet. Create a category before adding drugs.
                    </div>}

                    <section className="mt-4" aria-label="Drugs to save">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <h3 className="h6 mb-0">Drugs to save</h3>
                            <span className="badge text-bg-secondary rounded-pill" aria-live="polite">{pending.length}</span>
                        </div>
                        {!pending.length
                            ? <div className="border rounded-3 bg-body-tertiary text-center text-body-secondary small py-4 px-3">
                                Drugs you add will be listed here until you save.
                            </div>
                            : <div className="table-responsive" role="region" aria-label="Drugs to save" tabIndex={0}>
                                <table className="table table-sm table-hover align-middle text-start mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col">Drug</th>
                                            <th scope="col">Category</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending.map(item => <tr key={item.id}>
                                            <td className="text-break">{item.drug}</td>
                                            <td>{categoryName(item.category)}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    aria-label={`Remove ${item.drug} from the list`}
                                                    onClick={() => setPending(current => current.filter(drug => drug.id !== item.id))}
                                                >Remove</button>
                                            </td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>}
                    </section>
                </>}
            </fieldset>
        </div>

        <div className="card-footer bg-body d-flex flex-wrap align-items-center justify-content-end gap-2 py-3 px-3 px-md-4">
            {isEditing
                ? <>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={saving}
                        onClick={() => {
                            if (window.confirm('Discard unsaved drug changes?')) onCancel?.();
                        }}
                    >Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                        {saving ? 'Saving…' : 'Save drug'}
                    </button>
                </>
                : <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || !pending.length}
                    onClick={() => void save()}
                >
                    {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                    {saving ? 'Saving…' : pending.length ? `Save ${pending.length} ${pending.length === 1 ? 'drug' : 'drugs'}` : 'Save drugs'}
                </button>}
        </div>
    </form>;
}