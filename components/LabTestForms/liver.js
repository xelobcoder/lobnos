import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useMemo } from "react";
import { customFetch } from "../Auth/customFetch";
import CommentSection from "./commentSection";

export default function LiverTest() {
  const [data, setData] = useState({
    alt: "",
    ast: "",
    alp: "",
    total_bilirubin: "",
    direct_bilirubin: "",
    indirect_bilirubin: "",
    albumin: "",
    globulin: "",
    total_protein: "",
    ggt: "",
    comment: "",
  });


  //  using usememo to fetch data from the server

  useMemo(async () => {
    try {
      let response = await customFetch('test/setup/chemistry?panelname=LIVER_SETUP');
      setData(response?.records);
    }
    catch(err) {
      console.log(err);
      setData([]);
    }
  }, []);
  return (
    <>
      <div className="p-4"  style={{backgroundColor:'whitesmoke'}}>
        <div>
          <h5>Liver Function Test</h5>
          <form className="bg-white">
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>paramater</th>
                  <th>value</th>
                  <th> unit</th>
                  <th>reference</th>
                </tr>
              </thead>
              <tbody >
                { data.length > 0 &&
                  data.map((item, index) => {
                    return (
                      <tr key={index} className="border-bottom">
                        <td>{item.parameter}</td>
                        <td><input type='number' name={item.parameter} style={{ height: '30px' }} step={'0.5'}  /></td>
                        <td>{item.unit}</td>
                        <td>{item.upper} - {item.lower}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </form>
          <CommentSection />
        </div>
      </div>
    </>
  )
}