import React from "react";

export default function TatForm({ data, handleChangeWithState, setTestData }) {
    return (
        <>
            <h5>Tat(Turn Around Time) Set Up</h5>
            <div className="form-row grid-reg d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                    <label className="col-2 pls-label">Tat Count:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "tatCount", setTestData, data)}
                        className="custom-input col-2 mx-3"
                        value={data.tatCount}
                        placeholder="Count of test to use"
                    />
                    <select
                        onChange={(ev) => handleChangeWithState(ev, "tatEvaluation", setTestData, data)}
                        className="custom-select col-2"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>

                {/* Pre Tat Row */}
                <div className="d-flex align-items-center mb-3">
                    <label className="col-2 pls-label">Pre Tat:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "pre_Tat", setTestData, data)}
                        className="custom-input col-2 mx-3"
                        value={data.pre_Tat}
                        placeholder="Pre Tat value"
                    />
                    <select
                        value={data.pre_TatEvaluation}
                        onChange={(ev) => handleChangeWithState(ev, "pre_TatEvaluation", setTestData, data)}
                        className="custom-select col-2"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>

                {/* Tat Row */}
                <div className="d-flex align-items-center mb-3">
                    <label className="col-2 pls-label">Tat:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "tat", setTestData, data)}
                        className="custom-input col-2 mx-3"
                        value={data.tat}
                        placeholder="Tat Value"
                    />
                    <select
                        value={data.tatEvaluation}
                        onChange={(ev) => handleChangeWithState(ev, "tatEvaluation", setTestData, data)}
                        className="custom-select col-2"
                    >
                        <option value={'min'}>min</option>
                        <option value={'hour'}>hours</option>
                        <option value={'seconds'}>seconds</option>
                    </select>
                </div>

                {/* Post Tat Row */}
                <div className="d-flex align-items-center mb-3">
                    <label className="col-2 pls-label">Post Tat:</label>
                    <input
                        type="number"
                        onChange={(ev) => handleChangeWithState(ev, "post_Tat", setTestData, data)}
                        className="custom-input col-2 mx-3"
                        value={data.post_Tat}
                        placeholder="Post Tat Value"
                    />
                    <select
                        value={data.post_TatEvaluation}
                        onChange={(ev) => handleChangeWithState(ev, "post_TatEvaluation", setTestData, data)}
                        className="custom-select col-2"
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