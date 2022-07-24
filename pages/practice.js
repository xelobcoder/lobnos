import {createTable} from '../components/table.js';
import {useEffect,useState,useRef} from 'react';
import Header from '../components/header.js';
import SidebarFrontPage from '../components/frontpagesidebar.js';


function Practice() {
  const [show,setShow] = useState(true);
  const hasMounted = useRef(false);

    useEffect(() => {
        if (hasMounted.current === false) {
            createTable('toxic','tablequery');
            hasMounted.current = true;
        }

        
    },[show])

    return(
        <div>
            <div className='p-5'>
                <div id='tablequery'>

                </div>
                <table className='table display p-3 mt-5 no-footer dataTable' id='toxic'>
                   
                </table>
            </div>
            <div className='meme'>
              
            </div>
        </div>
    )
}


export  default Practice;


Practice.getLayout = function(page) {
    return (
       <>
         <Header/>
         <div className="wrapper">
            <div className="side">
                <SidebarFrontPage/>
            </div>
            <div className="main">
                {page}
            </div>
         </div>
       </>
    )
  }