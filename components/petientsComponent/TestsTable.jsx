import { useCallback, useEffect, useState,useRef } from "react"
import { customFetch } from "../Auth/customFetch"
import TableTrPatient from "./TableTrPatient"
import NotSelected from "./NotSelected"
import OptionsTrackClient from "./OptionsTrackClient"

export default function TestsTable({ billingid }) {
  const [result, setResults] = useState([])
  const TrackRef = useRef();

  const testStatus = useCallback(async function () {
    const response = await customFetch(`testpanel/list/update?billingid=${billingid}`)
    const { statusCode, result } = response
    setResults(result)
  },[billingid])

  useEffect(() => {
    testStatus()
  }, [testStatus])

  const openModal = () => {
    TrackRef.current.handleShow
  }



  return (
    <>
      {result.length > 0 ? (
        <div className="p-2">
          <h5 className="text-capitalize">Transaction test records</h5>
          <table className="table">
            <thead className="table-secondary text-capitalize br-7">
              <tr>
                <th>billing id</th>
                <th>test name</th>
                <th>sample</th>
                <th>processed</th>
                <th>result ready</th>
                <th>result approved</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {result.length > 0 && result.map((item, index) => <TableTrPatient openModal={openModal} key={index} index={index} item={item} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <NotSelected message={"select a transaction date to continue"} />
      )}
      <OptionsTrackClient  ref={TrackRef} />
    </>
  )
}
