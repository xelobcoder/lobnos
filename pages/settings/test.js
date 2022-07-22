import LipidFunction from '../../components/setup/biochemistry/lipid';
import LiverPanel from '../../components/setup/biochemistry/liver';
import Renal from '../../components/setup/biochemistry/renal';
// import {Link, Outlet} from 'react-router-dom';
import Sidebar from '../../components/sidebar';
export default function TestPanels() {
    return (
      <div className="wrapper-top-panel">
          <div className="side">
              <Sidebar/>
          </div>
          <div className="main" style={{overflowY: 'auto', height:'600px'}}>
             <div>
               {/* <LiverPanel/> */}
             </div>
             <div>
               <Renal/>
             </div>
             <div>
               {/* <LipidFunction/> */}
             </div>
          </div>
      </div>
    )
}