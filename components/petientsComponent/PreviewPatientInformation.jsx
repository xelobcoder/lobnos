import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import CardRack from "../../components/accessories/CardRacks"
import Loader from "../accessories/Loader"

export default function PreviewPatientInformation({ patientid }) {
  const [data, setData] = useState({})
  const [isloading, setLoading] = useState(true)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setLoading(true)
    customFetch(`register/personalinformation?patientid=${patientid}`)
      .then((data) => {
        setData(data?.result)
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        setData({})
      })
  }, [patientid])

  return (
    <>
      {isloading ? (
        <Loader />
      ) : (
        <CardRack
          activestate={active}
          header={
            <h5
              onClick={(ev) => {
                setActive(!active)
              }}>
              Patient Information Summary
            </h5>
          }
          body={
            <>
              <div className="grid-50 m-0" style={{ gridGap: "0px" }}>
                <ul className="d-flex justify-content m-0">
                  <li className="text-capitalize">fullname: </li>
                  <li className="text-capitalize mx-2">
                    {" "}
                    {data?.firstname} {data?.middlename} {data?.lastname}
                  </li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">Email:</li>
                  <li className="mx-2">{data?.email}</li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">date of birth: </li>
                  <li className="mx-2">{new Date(data?.dob).toLocaleDateString()}</li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">age: </li>
                  <li className="mx-2">
                    {data?.age} {data?.agetype}
                  </li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">mobile number: </li>
                  <li className="mx-2">0{data?.mobile}</li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">gender:</li>
                  <li className="mx-2">{data?.gender}</li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">marital status:</li>
                  <li className="mx-2">{data?.maritalstatus}</li>
                </ul>
                <ul className="d-flex m-0">
                  <li className="text-capitalize">Registration Date:</li>
                  <li className="mx-2">{new Date(data?.date).toLocaleDateString()}</li>
                </ul>
              </div>
            </>
          }
        />
      )}
    </>
  )
}
