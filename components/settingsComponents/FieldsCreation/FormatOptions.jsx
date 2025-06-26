export default function ReformatTestParamOptions({ stringdata }) {
    if (typeof stringdata != "string" || stringdata.trim().length === 0 || !stringdata.includes(",")) return "";

    const stringdataArray = stringdata.split(",").filter( (a,i) => a.trim() !== "");
    return (<span>
        {stringdataArray.length > 0 && stringdataArray.map((item, index) => <ol style={{margin:0,padding:0}} key={index}>{index + 1} {"."} {item}</ol>)}
    </span>
    )
}