"use client";

import { useEffect, useState } from 'react';
import { customFetch, customPost } from '../Auth/customFetch';

interface ScientistAccess {
    employeeid: number;
    username: string;
    role: string;
    branch: number | null;
    view: boolean;
    manage: boolean;
}

interface TestPanelStaffAccessProps {
    isVisible: boolean;
}

export default function TestPanelStaffAccess({ isVisible }: TestPanelStaffAccessProps) {
    const [staff, setStaff] = useState<ScientistAccess[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingEmployee, setSavingEmployee] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (!isVisible) return;
        let active = true;
        setLoading(true);
        setError('');
        customFetch('testpanel/staff-access')
            .then(response => {
                if (!response || response.status !== 'success' || !Array.isArray(response.result)) {
                    throw new Error(response?.message || 'Unable to load scientist access.');
                }
                if (active) setStaff(response.result);
            })
            .catch(fetchError => {
                console.error('Unable to load scientist test-panel access:', fetchError);
                if (active) setError(fetchError instanceof Error ? fetchError.message : 'Unable to load scientist access.');
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [isVisible]);

    const updateGrant = (employeeid: number, patch: Partial<Pick<ScientistAccess, 'view' | 'manage'>>) => {
        setStaff(current => current.map(person => {
            if (person.employeeid !== employeeid) return person;
            const next = { ...person, ...patch };
            if (patch.manage === true) next.view = true;
            if (patch.view === false) next.manage = false;
            return next;
        }));
        setNotice('');
    };

    const saveGrant = async (person: ScientistAccess) => {
        setSavingEmployee(person.employeeid);
        setError('');
        setNotice('');
        try {
            const response = await customPost('testpanel/staff-access', 'PUT', {
                employeeid: person.employeeid,
                view: person.view,
                manage: person.manage,
            });
            if (response?.status !== 'success') throw new Error(response?.message || 'Unable to save access.');
            setNotice(`Access updated for ${person.username}.`);
        } catch (saveError) {
            console.error('Unable to save scientist test-panel access:', saveError);
            setError(saveError instanceof Error ? saveError.message : 'Unable to save access.');
        } finally {
            setSavingEmployee(null);
        }
    };

    if (!isVisible) return null;
    if (loading) return <div className="p-3" role="status">Loading scientist access...</div>;

    return (
        <section className="p-3" aria-labelledby="test-panel-staff-access-title">
            <h4 id="test-panel-staff-access-title">Delegate test-panel access</h4>
            <p className="text-muted">
                Choose which scientists can open the test-panel page and which can create or edit tests,
                parameters, conditions, reference ranges, and related settings. Test deletion is never delegated here;
                only a super-admin can drop a test. Access is assigned to the staff member, but applies only while
                they are using an assigned scientist role.
            </p>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {notice && <div className="alert alert-success" role="status">{notice}</div>}
            {staff.length === 0 ? (
                <div className="alert alert-info" role="status">No scientists are available in your branch.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th scope="col">Scientist</th>
                                <th scope="col">Role</th>
                                <th scope="col">View page</th>
                                <th scope="col">Manage tests</th>
                                <th scope="col">Save</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(person => (
                                <tr key={person.employeeid}>
                                    <th scope="row">{person.username} <span className="text-muted">({person.employeeid})</span></th>
                                    <td>{person.role}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            aria-label={`Allow ${person.username} to view test panels`}
                                            checked={person.view}
                                            onChange={event => updateGrant(person.employeeid, { view: event.target.checked })}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            aria-label={`Allow ${person.username} to manage test panels`}
                                            checked={person.manage}
                                            onChange={event => updateGrant(person.employeeid, { manage: event.target.checked })}
                                        />
                                        <small className="d-block text-muted">Includes add/edit; excludes delete</small>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            disabled={savingEmployee !== null}
                                            onClick={() => void saveGrant(person)}
                                        >
                                            {savingEmployee === person.employeeid ? 'Saving...' : 'Save'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
