const determineTableColor = (value, upperlimit, lowerlimit) => {
   if (!isNaN(value) && value != "" && !isNaN(upperlimit) && !isNaN(lowerlimit)) {
      value = parseFloat(value);
      upperlimit = parseFloat(upperlimit);
      lowerlimit = parseFloat(lowerlimit);
      return (value > upperlimit || value < lowerlimit) ? "table-danger" :
         "table-success"
   }
}


// export const defaultCreationRule = {
//    name: "",
//    field: "",
//    value: "",
//    options: "",
//    testid: "",
//    hasunits: false,
//    units: "",
//    plan: "",
//    plain: "",
//    fieldConstraints: [],
//    ordering: "",
//    isValueTracked: 0,
// }



const determineResultEntryMode = (entrymode = "manual", value) => {
   if (value == "" || value == 0 && !entrymode) return "None".charAt(0).toUpperCase();
   if (value && entrymode) return entrymode.charAt(0).toUpperCase();

}
export const fieldDeterminer = (item, statehandler, index) => {
   if (typeof item !== 'object') return false;
   const { field, useplain, plain, name, hasoptions, options, entrymode, value, type, mode, units, upperlimit = 0, lowerlimit = 0, haslimits } = item;
   


   if (field === "input" || hasoptions == false && useplain != true) {
      if (haslimits) {
         return (
            <tr className={determineTableColor(value, upperlimit, lowerlimit)}>
               <td>{name}</td>
               <td><input placeholder={name} name={name}
                  onChange={(ev) => { statehandler(name, ev, index) }}
                  className="custom-input col-12" type={type}
                  value={value ? value : ''} />
                  <br />
                  {item?.previous_record?.value != null && (
                     <span className="text-sm text-dark">
                        Previous record on {new Date(item.previous_record.created_on).toLocaleDateString()}: {item.previous_record.value} {units}
                     </span>)}
               </td>
               <td>{units}</td>
               <td >{lowerlimit}{"~"}{upperlimit} </td>
               <td>
                  <span className={`btn btn-sm rounded-5 text-sm ${(entrymode == "manual" || !entrymode) ? "btn-warning" : "btn-success"}`}>{determineResultEntryMode(entrymode,value)}</span>
               </td>
            </tr>
         )
      }
      return (
         <tr>
            <td>{name}</td>
            <td>
               <input placeholder={name} onChange={(ev) => { statehandler(name, ev, index) }} className="custom-input" type={type} value={value ? value : ''} />
            </td>
         </tr>
      )
   }


   if (hasoptions == true) {
      const children = options.split(",");
      return (
         <tr>
            <td>{name}</td>
            <td>
               <select placeholder={name} onChange={(ev) => { statehandler(name, ev, index) }} value={value ? value : ''} className="custom-select">
                  <option>please select an option</option>
                  {children.map((item, index) => <option key={index} >{item}</option>)}
            </select>
            </td>
            <td>{units}</td>
         </tr>
      )
   }


   if (useplain) {
      let plainField = plain;
      if (plain.toString().includes(",")) {
         plainField = plain
            .toString()
            .split(',')
            .map((item, index) => { return <span key={index}> {item} <br /></span> })
      }
      
      return (
         <tr>
            <td>{name}</td>
            <td><input placeholder={name} name={name} onChange={(ev) => { statehandler(name, ev, index) }} className="custom-input" type={type} value={value ? value : ''} /></td>
            <td>{units}</td>
            <td>{plainField}</td>
         </tr>
      )
   }

   console.log(useplain, plain);
}