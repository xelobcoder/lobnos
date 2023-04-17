import { TextField, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { customFetch } from "../Auth/customFetch";
import MARKDOWN_EDITOR from "../accessories/markdownEditor";
import CommentSection from "./commentSection";
export default function RenalResults() {
  const [setup, setSetup] = useState([]);
  const [data, setData] = useState([

  ])

  useMemo(async () => {
    const response = await customFetch('test/setup/chemistry?panelname=RENAL_SETUP');
    setSetup(response?.records)
  }, [data])


  console.log(setup)



  const handleSetupData = (name, item) => {
    const result = setup.find((item) => item.parameter === name);
    return result?.[item];
  }
  return (
    <>
      <div className="continue-scroll p-4" style={{backgroundColor:'whitesmoke'}} >
        <div>
          <h5>Renal Function Test </h5>
          <form className="bg-white">
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>paramater</th>
                  <th>value</th>
                  <th> unit</th>
                  <th>reference range </th>
                </tr>
              </thead>
              <tbody >
                {
                  setup.map((item, index) => {
                    return (
                      <tr key={index} className="border-bottom">
                        <td>{item.parameter}</td>
                        <td><input type='number' style={{height:'30px'}} step={'0.5'} /></td>
                        <td>{item.unit}</td>
                        <td>{item.upper} - {item.lower}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </form>
          <CommentSection/>
        </div>
      </div>
    </>
  )
}