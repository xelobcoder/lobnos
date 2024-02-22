import MainSettingsLayoutView from "../../../../../components/settingsComponents/MainSettingsLayoutView";
import dynamic from 'next/dynamic';
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../components/accessories/markdownEditor'), { ssr: false })
export default function Procedure() {

   const updatedata = (event, data) => {
      console.log(data)
   }
   return (
      <MainSettingsLayoutView>
         <div className="mx-2">
            <h4>Procedure Manual </h4>
            <input type='text' className='custom-input' placeholder="Type in title of Manual here here" />
         </div>
         <div className="mx-2 mt-2">
            <MARKDOWN_EDITOR initialData={'Type procedure manual here'} updatedata={updatedata} />
         </div>
      </MainSettingsLayoutView>
   )
}