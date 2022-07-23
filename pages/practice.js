import {createTableHead,createTableBody,TableTopFooter,createTableFooter} from '../components/table.js';
import {useEffect,useState,useRef} from 'react';




function Practice() {
  const [show,setShow] = useState(true);
  const hasMounted = useRef(false);

    useEffect(() => {
        const createTable = function() {
            let toxic = document.getElementById('toxic');
            toxic.appendChild(createTableHead());
            toxic.appendChild(createTableBody());
            toxic.appendChild(createTableFooter())
            console.log(toxic)
        }


        if (hasMounted.current === false) {
            createTable();
            hasMounted.current = true;
        }

        
    },[show])

    return(
        <div>
            <div className='p-5'>
                <table className='table table-striped display' id='toxic'>
                    <thead>
                        
                    </thead>
                </table>
            </div>
        </div>
    )
}


export  default Practice;