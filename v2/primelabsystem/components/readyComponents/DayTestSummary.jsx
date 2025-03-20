import { useEffect, useState } from "react"
import Sampling from "./Sampling"
import { getDateExpression, customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"
import SECOND_NO_DATA from "../accessories/secondNodata"

export default function DayTestSummary() {
  const [isloading, setLoading] = useState(true)
  const [data, setData] = useState([])

  const getData = async () => {
    try {
      setLoading(true)
      const summary = await customFetch(`result/ready/crm/summary?querydate=${getDateExpression}`)
      setData(summary)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setData([])
    }
  }
  useEffect(() => {
    getData()
  }, [])

  const renderer = () => {
    if (isloading) {
      return <Loader />
    } else {
      if (data.length === 0) {
        return <SECOND_NO_DATA />
      } else {
        return (
          <div>
            <div className="card mt-2">
              <div className="card-header bg-secondary text-white">
                <h6>Summary for the day</h6>
              </div>
              <div className="mx-2">
                <div id="ready-summary-view">
                  {data.map((item, index) => {
                    return (
                      <div key={index}>
                        <Sampling data={item} colorIndex={index} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  }
  return <>{renderer()}</>
}
