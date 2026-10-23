import React, { ChangeEvent } from "react";

interface TestData {
    tatCount: string;
    tatEvaluation: string;
    pre_Tat: string;
    pre_TatEvaluation: string;
    tat: string;
    post_Tat: string;
    post_TatEvaluation: string;
    [key: string]: any;
}

interface TatFormProps {
    data: TestData;
    handleChangeWithState: (
        ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: string,
        setter: React.Dispatch<React.SetStateAction<TestData>>,
        data: TestData
    ) => void;
    setTestData: React.Dispatch<React.SetStateAction<TestData>>;
}

const TatForm: React.FC<TatFormProps> = ({ data, handleChangeWithState, setTestData }) => {
    return (
        <>
            <h5>Tat(Turn Around Time) Set Up</h5>
            <div className="form-row grid-reg d-flex flex-column">
                {/* Tat Count Row */}
                <div className="d-flex align-items-center mb-3 gap-2">
                    <label className="col-3 pls-label">Tat Count:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "tatCount", setTestData, data)}
                        className="custom-input flex-grow-1"
                        value={data.tatCount ?? ""}
                        placeholder="Count of test to use"
                    />
                    <select
                        value={data.tatEvaluation ?? ""}
                        onChange={(ev) => handleChangeWithState(ev, "tatEvaluation", setTestData, data)}
                        className="custom-select flex-grow-1"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>

                {/* Pre Tat Row */}
                <div className="d-flex align-items-center mb-3 gap-2">
                    <label className="col-3 pls-label">Pre Tat:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "pre_Tat", setTestData, data)}
                        className="custom-input flex-grow-1"
                        value={data.pre_Tat ?? ""}
                        placeholder="Pre Tat value"
                    />
                    <select
                        value={data.pre_TatEvaluation ?? ""}
                        onChange={(ev) => handleChangeWithState(ev, "pre_TatEvaluation", setTestData, data)}
                        className="custom-select flex-grow-1"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>

                {/* Tat Row */}
                <div className="d-flex align-items-center mb-3 gap-2">
                    <label className="col-3 pls-label">Tat:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "tat", setTestData, data)}
                        className="custom-input flex-grow-1"
                        value={data.tat ?? ""}
                        placeholder="Tat Value"
                    />
                    <select
                        value={data.tatEvaluation ?? ""}
                        onChange={(ev) => handleChangeWithState(ev, "tatEvaluation", setTestData, data)}
                        className="custom-select flex-grow-1"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>

                {/* Post Tat Row */}
                <div className="d-flex align-items-center mb-3 gap-2">
                    <label className="col-3 pls-label">Post Tat:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "post_Tat", setTestData, data)}
                        className="custom-input flex-grow-1"
                        value={data.post_Tat ?? ""}
                        placeholder="Post Tat Value"
                    />
                    <select
                        value={data.post_TatEvaluation ?? ""}
                        onChange={(ev) => handleChangeWithState(ev, "post_TatEvaluation", setTestData, data)}
                        className="custom-select flex-grow-1"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default TatForm;
