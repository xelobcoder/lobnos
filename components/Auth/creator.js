export const fieldDeterminer = (item) => {
   if (typeof item !== 'object') return false;
   const { field, name, label, hasChildren, options, value, type, mode, upperlimit = 0, lowerlimit = 0, haslimits } = item;

   if (field === "input") {
      if (haslimits && mode == 'setup') {
         return (
            <div>
               <label>{label}</label>
               <div className='d-flex'>
                  <input name={name} className="custom-input" type={type} value={value ? value : ''} />
                  <input
                     placeholder="upper limit" name='uplimit' value={upperlimit} className="custom-input mx-2" type='number' />
                  <input
                     placeholder="lower limit" name='lwlimit' className="custom-input mx-2" value={lowerlimit} type='number' />
               </div>
            </div>
         )
      }
      return (
         <div>
            <label>{label}</label>
            <input className="custom-input" type={type} value={value ? value : ''} />
         </div>
      )
   }


   if (field === "select") {
      return (
         <div>
            <label>{label}</label>
            <select value={value ? value : ''} className="custom-select">
               {hasChildren && options.length > 0
                  && (options.map((item, index) => {
                     return <option key={index} value={item}>{item}</option>
                  }))
               }
            </select>
         </div>
      )
   }
}