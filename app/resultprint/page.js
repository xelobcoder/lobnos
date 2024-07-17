import { headers } from 'next/headers';

async function getDetails() {
          return { patientid: 3333333}
}

export default async function ResultTemplateLay() {
          const { patientid } = await getDetails();

          return (<div>Result
                    {"\n"}
                    {"\n"}
                    {"\n"}
                    {"\n"}
                    {"\n"}
                    <h1>{patientid}</h1>
          </div>)
}