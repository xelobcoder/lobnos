"use client"
import { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { customPost, handleChangeWithState } from "../../../../../../components/Auth/customFetch";

interface FormData {
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
    const [data, setData] = useState<FormData>({ name: '', iscustom: 1 });

    const handleSubmit = async (ev: MouseEvent<HTMLButtonElement>) => {
        const method = testid && testname ? 'PUT' : 'POST';
        try {
            ev.preventDefault();
            if (data.name.trim() === "") {
                return toast.error("Test name cannot be empty", { autoClose: 1000 });
            }
            
            const response = await customPost(
                'testpanel/list/createcustom?stage=1', 
                method, 
                data
            );

            if (response.status === "success") {
                const message = method === "POST" 
                    ? "New test created successfully" 
                    : "Test updated successfully";
                toast.success(message, { autoClose: 500 });
                setData({ ...data, name: '' });
            } else {
                const errorMessage = method === "POST" 
                    ? response?.message || "Test creation failed" 
                    : "Test update failed";
                toast.error(errorMessage, { autoClose: 2000 });
            }
        } catch (err) {
            toast.error((err as Error).message, { autoClose: 3000 });
        }
    };

    useEffect(() => {
        if (testid && testname) {
            const parsedTestId = parseInt(testid, 10);
            setData({ 
                name: testname, 
                iscustom: 1, 
                testid: isNaN(parsedTestId) ? undefined : parsedTestId
            });
        }
    }, [testid, testname]);

    return (
        <form className="mx-2 border border-secondary-subtle p-2 bg-white">
            <div className="border-bottom">
                <h5>Create a custom test</h5>
            </div>
            <div className="form-row grid-reg mt-2 mx-2">
                <label className="mt-2">Test Name</label>
                <input 
                    value={data.name} 
                    onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                        handleChangeWithState(ev, 'name', setData, data);
                    }} 
                    className="custom-input" 
                    type="text" 
                />
            </div>
            <div className="d-flex justify-content-end">
                <button 
                    onClick={handleSubmit} 
                    type="button" 
                    className="btn btn-primary btn-sm mt-2"
                >
                    {testid ? "Update Test" : "Add Test"}
                </button>
            </div>
        </form>
    );
}