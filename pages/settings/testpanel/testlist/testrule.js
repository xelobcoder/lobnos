import { fieldDeterminer } from "../../../../components/Auth/creator"

export default function CreateTestRule() {
   const rule = [
      {
         field: 'input',
         label: 'uric acid',
         hasChildren: false,
         haslimits: true,
         upperlimit: 300,
         lowerlimit: 100,
         mode: 'setup'
      },
      {
         field: 'select',
         label: 'patameine',
         hasChildren: true,
         options: ['1/20', '1/80', '1/160'],
         haslimits: false,
         mode: 'setup'
      }
   ]
   return (
      <section>
         <h5>Test Rule</h5>
         <hr />
         {rule.map((item, index) => fieldDeterminer(item))}
      </section>
   )
}