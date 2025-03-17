import CreateTestFields from '../../../../../components/settingsComponents/FieldsCreation/createfieldsComponent';
import { customFetch } from '../../../../../components/Auth/customFetch';
export default async function CreateSingleFieldPage({ searchParams }: { searchParams: { testid: Number, testname: string } }) {
   const { testid, testname } = await searchParams

   if (!testid) {
      return <div className='bg-danger-subtle pls-label p-3 col-4 br-5 plas-color'>Test Not regcognized</div>
   }

   const [testdata, fieldConstraintsCategorization, testRules] = await Promise.all([
      customFetch(`gettestpanel/edit?id=${testid}`),
      customFetch(`test/fields/category/test/${testid}`),
      customFetch(`testpanel/list/customtestrule?testid=${testid}`)
   ]);

   console.log(testdata, fieldConstraintsCategorization, testRules)

   return (
      <div>
         <CreateTestFields
            fieldConstraintsCategorization={fieldConstraintsCategorization}
            testRules={testRules}
            testdata={testdata}
            testname={testname}
            testid={testid} />
      </div>
   )
}