import {createTable} from '../components/table.js';
import {useEffect,useState,useRef} from 'react';




function Practice() {
  const [show,setShow] = useState(true);
  const hasMounted = useRef(false);

    useEffect(() => {
        if (hasMounted.current === false) {
            createTable('toxic');
            hasMounted.current = true;
        }

        
    },[show])

    return(
        <div>
            <div className='p-5'>
                <table className='table display p-3 mt-5 no-footer dataTable' id='toxic'>
                   
                </table>
            </div>
            <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
               <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
             </svg>
            </div>
        </div>
    )
}


export  default Practice;