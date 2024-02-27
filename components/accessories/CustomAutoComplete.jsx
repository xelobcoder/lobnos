import { useEffect, useState,useRef, useCallback} from "react"

export default function CustomAutocomplete(props) {
   const [workingdata, setWorkingdata] = useState(props.data);
   const [display, setDisplay] = useState(false);
   const [selected, setselected] = useState(null);
   const [active, setActive] = useState(0);
   const wrapperRef = useRef();
   const [search, setSearch] = useState('');
  
   const customfilter = (event, search) => {
      const target = props.target.toLowerCase();
      event.preventDefault();
      setSearch(search);
      setActive(0);
      if (search.length === 0) {
         setWorkingdata(props.data);
         setActive(0);
         setDisplay(true);
         return;
      }

      if (search.length > 0 && workingdata.length > 0) {
         const matched = workingdata.filter((t, i) => {
            return (t[target].toLowerCase().includes(search.toLowerCase()));
         });
         setWorkingdata(matched);
         setActive(0);
         return;
      }
   }


   const handleOutRefClick = (event) => {
      const { current: wrap } = wrapperRef;
      if (wrap && !wrap.contains(event.target)) {
         setDisplay(false);
         setActive(0);
      }
   };
   

   useEffect(() => {
      document.addEventListener("mousedown", handleOutRefClick);
      return () => {
         document.removeEventListener("mousedown",handleOutRefClick)
      }
   }, [])
   

   const incrementActive = () => {
      if (active < workingdata.length - 1 ) {
         setActive(active + 1);
      }
   }

   const decrementActive = () => {
      if (active > 0 && active <= workingdata.length - 1) {
         setActive(active - 1);
      }
   }

   const handleTab = () => {
      setActive(0);
      const value = workingdata[active][props.target];
      setSearch(value);
      setDisplay(false);
   }
   const handleKeysPress = (event) => {
      switch(event.code) {
         case 'ArrowDown':
            incrementActive();
            break;
         case 'ArrowUp':
            decrementActive();
            break;
         case 'Enter':
            handleEnter();
            break;
         case 'Tab':
            handleTab();
            break;   
         default:
            return;
       }
   }

   const handleEnter = () => {
      const value = workingdata[active][props.target];
      setselected(workingdata[active]);
      setSearch(value);
      setDisplay(false);
   }

   const handleItemClick = (index) => {
      const value = workingdata[index][props.target];
      setSearch(value);
      setselected(workingdata[index]);
      setDisplay(false);
   }


   const handleEnterKey = (event) => {
      if (event.code === 'Enter') {
         handleEnter();
      }

      if (event.code === 'ArrowDown') {
         incrementActive();
      }

      if (event.code === 'ArrowUp') {
         decrementActive();
      }
   }

   const handleChange = useCallback(() => {
      props.onChange(selected);
   }, [selected, props]);

   useEffect(() => {
      if (selected != null) {
         handleChange();
     }
   },[handleChange,selected])



   return (
     <>
       <div {...props} ref={wrapperRef}>
         <input
           onClick={(ev) => setDisplay(true)}
           className="custom-input"
           onKeyDown={handleKeysPress}
           placeholder={props.label}
           type="text"
           value={search}
           onChange={(event) => {
             customfilter(event, event.target.value)
           }}
         />
         <span></span>
         {display && (
           <div className="card mt-1" >
             {workingdata.map((option, index) => (
               <div
                 tabIndex={0}
                 style={{zIndex: 9999 }}
                 onClick={(ev) => {
                   handleItemClick(index)
                 }}
                 onKeyDown={(ev) => {
                   handleEnterKey(ev, index)
                 }}
                 className={`card-body card-autocomplete pointer border-bottom p-2 px-3 ${active === index ? "card-body-active" : "none"}`}
                 key={index}>
                 {option[props.target]}
               </div>
             ))}
           </div>
         )}
       </div>
     </>
   )
}