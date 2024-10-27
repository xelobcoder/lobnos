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


  if (isloading) return (<div className=" heightedBorder p-2 bg-secondary-subtle d-flex justify-content-center"> {"<"}Loading Patient Information please ....... {">"}</div>)

  return (
    <>
      <div >
        <ul className="pls-color text-sm m-0 list-group m-0 heightedBorder br-0">
          <li className="list-group-item text-capitalize bg-secondary-subtle fw-bold">fullname:  {data?.firstname} {data?.middlename} {data?.lastname}</li>
          <li className="list-group-item text-capitalize">Email: {data?.email}</li>
          <div className="list-group-item" style={{ display: 'grid', gridTemplateColumns: '50% auto' }}>
            <span className=" text-capitalize">date of birth:{new Date(data?.dob).toLocaleDateString()} </span>
            <span className=" text-capitalize">age: {data?.age} {data?.ageType} </span>
          </div>
          <div className="list-group-item" style={{ display: 'grid', gridTemplateColumns: '50% auto' }}>
            <span className="text-capitalize ">mobile number: 0{data?.mobile} </span>
            <span className="text-capitalize ">gender:{data?.gender}</span>
          </div>
          <div className="list-group-item" style={{ display: 'grid', gridTemplateColumns: '50% auto' }}>
            <span className="text-capitalize">marital status:{data?.maritalstatus}</span>
            <span className="text-capitalize">Registration Date: {new Date(data?.date).toLocaleDateString()}</span>
          </div>
        </ul>
      </div>
    </>
  )
}
