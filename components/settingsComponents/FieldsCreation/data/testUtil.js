import { customPost } from "../../../Auth/customFetch";

export const handleCreationMasterRUle = function (ev, field) {
    const { value } = ev.target;
    if (value === "options") { return { ...field, hasoptions: true } }
    else if (value === "plain") { return { ...field, useplain: true } }
    else if (value === "limits") { return { ...field, haslimits: true } }
    else return { ...field }
}


export const updateFieldsRules = async (data, toast, testid) => {
    if (data.length === 0) return;
    for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i]["ordering"])) {
            data[i]["ordering"] = i;
        }
    }
    let orderedData = data.sort((a, b) => a.ordering - b.ordering);
    const response = await customPost("testpanel/list/customtestrule", "PUT", { testid, data: orderedData });
    if (response.status === true) {
        toast.success("Test fields updated successfully", { autoClose: 500 });
    } else {
        toast.error(response?.message || "Test fields creation failed", { autoClose: 2000 });
    }
};

