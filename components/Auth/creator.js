
export const fieldDeterminer = (item, statehandler, index) => {
   if (typeof item !== 'object') return false;
   const { field, name, hasoptions, options, value, type, mode, units, upperlimit = 0, lowerlimit = 0, haslimits } = item;

   if (field === "input" || hasoptions == false) {
      if (haslimits) {
         return (
            <tr>
               <td>{name}</td>
               <td><input placeholder={name} name={name} onChange={(ev) => { statehandler(name, ev, index) }} className="custom-input" type={type} value={value ? value : ''} /></td>
               <td>{units}</td>
               <td>{upperlimit}{"-"} {lowerlimit}</td>
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
                  {children.map((item, index) => <option key={index} >{item}</option>)}
            </select>
            </td>
            <td>{units}</td>
         </tr>
      )
   }
}