"use client"
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTestPanelBasePath } from '../../../../../../components/settingsComponents/TestPanelWorkspace';
import { toast } from "react-toastify";
import { customPost } from "../../../../../../components/Auth/customFetch";
import styles from '../../../../../../styles/SmsTemplateList.module.css';
interface TestItem {
    name: string;
    iscustom: number;
    testid?: number;
    error?: string;
}

export default function CreateCustomTestList() {
    const searchQuery = useSearchParams();
    const testid = searchQuery?.get("testid");
    const testname = searchQuery?.get("testname");
    return <CreateCustomTestEditor key={`${testid || ""}:${testname || ""}`} testid={testid} testname={testname} />;
}

function CreateCustomTestEditor({ testid, testname }: { testid: string | null; testname: string | null }) {
    const router = useRouter();
    const basePath = useTestPanelBasePath();
    const [tests, setTests] = useState<TestItem[]>(() => {
        if (!testid || !testname) return [{ name: "", iscustom: 1 }];
        const parsedTestId = parseInt(testid, 10);
        return [{ name: testname, iscustom: 1, testid: Number.isNaN(parsedTestId) ? undefined : parsedTestId }];
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(() => testid && testname ? 0 : null);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (index: number, ev: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = ev.target;
        setTests(current => current.map((test, currentIndex) =>
            currentIndex === index ? { ...test, [name]: value, error: undefined } : test));
    };

    const addNewRow = () => {
        setTests(current => [...current, { name: '', iscustom: 1 }]);
    };

    const removeRow = (index: number) => {
        setTests(current => current.length <= 1
            ? current
            : current.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        if (saving) return;
        const emptyIndex = tests.findIndex(test => !test.name.trim());
        if (emptyIndex !== -1) {
            toast.error(`Enter a name for test ${emptyIndex + 1}.`, { autoClose: 2000 });
            return;
        }

        setSaving(true);
        try {
            if (editingIndex !== null) {
                const testToSubmit = tests[editingIndex];
                const method = testToSubmit.testid ? 'PUT' : 'POST';

                const response = await customPost(
                    'testpanel/list/createcustom?stage=1',
                    method,
                    testToSubmit
                );

                if (response.status === "success") {
                    toast.success(method === "POST" ? "New test created successfully" : "Test updated successfully");
                    setTests([{ name: '', iscustom: 1 }]);
                    setEditingIndex(null);
                } else {
                    toast.error(response?.message || (method === "POST" ? "Test creation failed" : "Test update failed"));
                }
            } else {
                const response = await customPost(
                    'testpanel/list/createcustom?stage=1',
                    'POST',
                    { name: tests }
                );
                if (!Array.isArray(response?.results) || response.results.length !== tests.length) {
                    toast.error(response?.message || "The batch response was incomplete. Your entries have been kept for retry.");
                    return;
                }
                const failedIndexes = new Set<number>();
                let successCount = 0;
                response.results.forEach((result: { status?: string }, index: number) => {
                    if (result?.status === "success") successCount += 1;
                    else failedIndexes.add(index);
                });
                if (successCount) toast.success(`${successCount} test(s) created successfully.`);
                if (failedIndexes.size) {
                    setTests(current => current.flatMap((test, index) => failedIndexes.has(index)
                        ? [{ ...test, error: response.results[index]?.reason || "Could not create this test." }]
                        : []));
                    toast.error(`${failedIndexes.size} test(s) failed. Failed entries remain for correction.`);
                } else {
                    setTests([{ name: '', iscustom: 1 }]);
                }
            }
        } catch (err) {
            toast.error((err as Error).message || "Unable to save tests.", { autoClose: 3000 });
        } finally {
            setSaving(false);
        }
    };

    return <form noValidate onSubmit={handleSubmit} className="card mx-2 bg-white shadow-none border">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h1 className="h5 mb-0">{editingIndex !== null ? "Edit test" : "Create custom tests"}</h1>
            <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => router.push(`${basePath}/testlist`)}>
                    Back to test list
                </button>
                {editingIndex === null && <button type="button" onClick={addNewRow} disabled={saving} className="btn btn-sm btn-primary">
                    Add row
                </button>}
            </div>
        </div>
        <div className="card-body">
            <p className="text-muted">Add tests one at a time or stage several names and submit them together.</p>
            <table className={styles.table}>
                <thead><tr><th style={{ width: '70%' }}>Test Name</th><th style={{ width: '20%' }}>Action</th></tr></thead>
                <tbody>{tests.map((test, index) => (
                    <tr key={test.testid ?? index}>
                        <td>
                            <label className="visually-hidden" htmlFor={`custom-test-name-${index}`}>Test name {index + 1}</label>
                            <input id={`custom-test-name-${index}`} name="name" value={test.name}
                                onChange={event => handleInputChange(index, event)}
                                className={`custom-input w-100${test.error ? " is-invalid" : ""}`}
                                type="text" maxLength={255} required disabled={saving} aria-invalid={Boolean(test.error)}
                                aria-describedby={test.error ? `custom-test-error-${index}` : undefined}
                                style={{ minWidth: '350px' }} />
                            {test.error && <div id={`custom-test-error-${index}`} className="invalid-feedback d-block">{test.error}</div>}
                        </td>
                        <td>
                            {tests.length > 1 && <button type="button" onClick={() => removeRow(index)}
                                className="btn btn-sm btn-outline-danger" disabled={saving}
                                aria-label={`Remove test row ${index + 1}`}>Remove</button>}
                        </td>
                    </tr>
                ))}</tbody>
            </table>
            <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : editingIndex !== null ? "Update test" : `Create ${tests.length} test${tests.length === 1 ? "" : "s"}`}
                </button>
            </div>
        </div>
    </form>;
}