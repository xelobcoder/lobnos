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
                    <thead>
                        
                    </thead>
                </table>
            </div>
        </div>
    )
}


export  default Practice;