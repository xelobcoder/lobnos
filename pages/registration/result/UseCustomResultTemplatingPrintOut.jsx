import ResultViewHtmlGenerator from "../../../components/Auth/ResultViewHtmlGenerator"

export default function UseCustomResultTemplatingPrintOut({ result, testname }) {


     return (
          <div >
               <h5 className="text-uppercase ui text-center border-bottom  border-2 border-secondary">
                    <span className="fw-bold">
                         {testname && testname.includes("_") ? testname.split("_").join(" ") : testname}
                    </span>
               </h5>
               <table className={"alpha-result-table"} >
                    <thead className={"table-warning"} >
                         <tr>
                              <th scope="col" >Parameter</th>
                              <th scope="col">Value</th>
                              <th scope="col">Units</th>
                              <th scope="col">References</th>
                              <th>Flags</th>
                         </tr>
                    </thead>
                    <tbody >
                         {Array.isArray(result) && result.map((item, index) => {
                              return <ResultViewHtmlGenerator index={index} field={item} key={index} />
                         })}
                    </tbody>
               </table>
          </div>
     )
}
