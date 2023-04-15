import { TextField, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { customFetch } from "../Auth/customFetch";
export default function RenalResults() {
  const [setup, setSetup] = useState([]);
  const [data, setData] = useState([
     
    ])

  useMemo(async () => {
    const response = await customFetch('test/setup/chemistry?panelname=RENAL_SETUP');
    setSetup(response?.records)
  }, [data])



  const handleSetupData = (name, item) => {
    const result = setup.find((item) => item.parameter === name);
    return result?.[item];
  }
  return (
    <>
      <div className="p-4" style={{ backgroundColor: 'whitesmoke', height: '100vh', borderRadius: '15px' }} >
        <div>
          <h5>Renal Function Test </h5>
          <form className="bg-white">
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>paramater</th>
                  <th>value</th>
                  <th> unit</th>
                  <th>upper</th>
                  <th>lower</th>
                  <th>flag</th>
                </tr>
              </thead>
              <tbody >
               
              </tbody>
              <tfoot>
                <tr>
                  <Button className="btn btn-primary mt-4" variant='contained'
                    color='primary'
                    onClick={(e) => handleResult(e)}>
                    save result
                  </Button>
                </tr>
              </tfoot>
            </table>
          </form>
        </div>
      </div>
    </>
  )
}