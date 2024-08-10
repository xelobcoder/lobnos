import { formatPlainOptionsToObject } from "../../Auth/customFetch";

export default function FormatPlainOptionsUsePlain({ plaindata }) {
    if (typeof plaindata != "string" || plaindata.trim().includes(";") == false) return "";



    function displayFormattedPlains(plaindata) {
        if (Object.keys(plaindata).length === 0 || typeof plaindata !== "object") return;
        return ['general', 'male', 'female', 'children'].map((item, index) => {
            return (
                <div key={index}><span >{`${item.toUpperCase()}:${plaindata[item.toLowerCase()]?.['upperLimit']}- ${plaindata[item.toLowerCase()]?.['lowerLimit']}`}</span><br /></div>
            )
        })
    }

    return <div>{displayFormattedPlains(formatPlainOptionsToObject(plaindata))}</div>
}