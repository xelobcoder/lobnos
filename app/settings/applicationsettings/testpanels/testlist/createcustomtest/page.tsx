"use client"
import { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { customPost, handleChangeWithState } from "../../../../../../components/Auth/customFetch";
import styles from '../../../../../../styles/SmsTemplateList.module.css'
interface TestItem {
    name: string;
    iscustom: number;
    testid?: number;
}

interface ApiResponse {
    status: string;
    message?: string;
}

export default function CreateCustomTestList() {
    const searchQuery = useSearchParams();
    const testid = searchQuery?.get("testid");
    const testname = searchQuery?.get("testname");
    const [tests, setTests] = useState<TestItem[]>([{ name: '', iscustom: 1 }]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleInputChange = (index: number, ev: ChangeEvent<HTMLInputElement>) => {
        const newTests = [...tests];
        newTests[index] = {
            ...newTests[index],
            [ev.target.name]: ev.target.value
        };
        setTests(newTests);
    };

    const addNewRow = () => {
        setTests([...tests, { name: '', iscustom: 1 }]);
    };

    const removeRow = (index: number) => {
        if (tests.length <= 1) return;
        const newTests = [...tests];
        newTests.splice(index, 1);
        setTests(newTests);
    };

    const handleSubmit = async (ev: MouseEvent<HTMLButtonElement>) => {
        try {
            ev.preventDefault();

            // Validate all test names
            for (const test of tests) {
                if (test.name.trim() === "") {
                    return toast.error("Test names cannot be empty", { autoClose: 1000 });
                }
            }

            // If editing a single test
            if (editingIndex !== null) {
                const testToSubmit = tests[editingIndex];
                const method = testToSubmit.testid ? 'PUT' : 'POST';

                const response = await customPost(
                    'testpanel/list/createcustom?stage=1',
                    method,
                    testToSubmit
                );

                if (response.status === "success") {
                    const message = method === "POST"
                        ? "New test created successfully"
                        : "Test updated successfully";
                    toast.success(message, { autoClose: 500 });

                    // Reset editing state
                    setEditingIndex(null);
                } else {
                    const errorMessage = method === "POST"
                        ? response?.message || "Test creation failed"
                        : "Test update failed";
                    toast.error(errorMessage, { autoClose: 2000 });
                }
            } else {
                // Submit all tests as a batch
                const response = await customPost(
                    'testpanel/list/createcustom?stage=1',
                    'POST',
                    { name: tests }
                );
                if (response && response.results) {
                    const successCount = response.results.filter((r: any) => r.status === 'success').length;
                    const failCount = response.results.length - successCount;
                    toast.success(`${successCount} test(s) created successfully`, { autoClose: 1000 });
                    if (failCount > 0) {
                        toast.error(`${failCount} test(s) failed to create`, { autoClose: 2000 });
                    }
                    setTests([{ name: '', iscustom: 1 }]);
                } else {
                    toast.error('Batch creation failed', { autoClose: 2000 });
                }
            }
        } catch (err) {
            toast.error((err as Error).message, { autoClose: 3000 });
        }
    };

    useEffect(() => {
        if (testid && testname) {
            const parsedTestId = parseInt(testid, 10);
            setTests([{
                name: testname,
                iscustom: 1,
                testid: isNaN(parsedTestId) ? undefined : parsedTestId
            }]);
            setEditingIndex(0);
        }
    }, [testid, testname]);

    return (
        <form className="mx-2 border border-secondary-subtle p-2 bg-white">
            <div className="border-bottom d-flex justify-content-between align-items-center">
                <h5>Create custom tests</h5>
                <button
                    type="button"
                    onClick={addNewRow}
                    className="btn btn-sm btn-outline-primary"
                >
                    Add Row
                </button>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '70%' }}>Test Name</th>
                        <th style={{ width: '20%' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map((test, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    name="name"
                                    value={test.name}
                                    onChange={(ev) => handleInputChange(index, ev)}
                                    className="custom-input w-100"
                                    type="text"
                                    style={{ minWidth: '350px' }}
                                />
                            </td>
                            <td>
                                {tests.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRow(index)}
                                        className="btn btn-sm btn-outline-danger"
                                    >
                                        Remove
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-end">
                <button
                    onClick={handleSubmit}
                    type="button"
                    className="btn btn-primary btn-sm mt-2"
                >
                    {editingIndex !== null ? "Update Test" : "Add Tests"}
                </button>
            </div>
        </form>
    );
}