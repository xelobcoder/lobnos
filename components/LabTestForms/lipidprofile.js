import { useState, useMemo } from "react";
import { TextField, Button } from "@mui/material";
import { customFetch } from "../../components/Auth/customFetch";
import CommentSection from "./commentSection";

export default function LipidProfile({ target }) {
  const [data, setData] = useState({
    total_cholesterol: 0,
    hdl_cholesterol: "",
    ldl_cholesterol: "",
    non_hdl_cholesterol: "",
    triglycerides: 0,
    vldl_cholesterol: "",
    t_chol_ratio: 0,
    comment: "",
  });


  const [forwardData, setForwardData] = useState([]);


  //  using usememo to fetch data from the server



  useMemo(async () => {
    try {
      let response = await customFetch('test/setup/chemistry?panelname=LIPID_PROFILE_SETUP');
      setData(response?.records);
      setForwardData(response?.records.map((item) => {
        return {
          parameter: item.parameter,
          value: '',
        }
      }))
    }
    catch (err) {
      console.log(err);
      setData([]);
    }
  }, []);



  return (
    <>
      <div className="p-2" style={{ backgroundColor: 'whitesmoke' }}>
        <div>
          <h5>Lipid Profile</h5>
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
                {data.length > 0 &&
                  (data.map((item, index) => {
                    return (
                      <tr key={index} className="border-bottom">
                        <td>{item.parameter}</td>
                        <td><input type='number' name={item.parameter} style={{ height: '30px' }} step={'0.5'} /></td>
                        <td>{item.unit}</td>
                        <td>{item.upper} - {item.lower}</td>
                      </tr>
                    )
                  }))
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