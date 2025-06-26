"use client"
import { useState, useEffect } from "react"
import CompanyHeaders from "../../../components/ResultView/CompanyHeaders"
import { customFetch, defaultResultSettings, formatTest, getResultSettings, readyToPrint } from "../../../components/Auth/customFetch"
import SamplingInformationResult from "../../../components/ResultView/SamplingInformationResult"
import PersonalInformation from "../../../components/ResultView/PersonalInformation"
import { useSearchParams } from "next/navigation"
import UseCustomResultTemplating from "../../../components/ResutlUI/useCustomResultTemplating"
import UseResultCommentSingle from "../../../components/ResutlUI/useResultCommentSingle"
import UseClinicalLiteratureReview from "../../../components/ResutlUI/UseClinicalLiteratureReview"
import UseResultEntryScientist from "../../../components/ResutlUI/UseResultEntryFormat"
import UseDisclaimer from "../../../components/ResutlUI/useDisclaimer"
import VersionFooter from "../../../components/accessories/VersionFooter"
import Form from "react-bootstrap/Form"
import Loader from "../../../components/accessories/Loader"
import { RiPrinterFill } from "@remixicon/react"

export default function LabReportPrintingMultiple() {
  const [resultsettings, setResultSettings] = useState(defaultResultSettings)
  const [testList, settestList] = useState([])
  const [loader, setLoader] = useState(false)
  const [toprintList, setPrintList] = useState([])
  const testid = useSearchParams()?.get("testid")
  const billingid = useSearchParams()?.get("billingid")
  const test = useSearchParams()?.get("test")
  const patientid = useSearchParams()?.get("patientid")

  useEffect(() => {
    const handleKeyPress = async function (event) {
      if (event.ctrlKey && event.key === "p") {
        await readyToPrint(billingid, testid)
      }
    }
    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  })

  useEffect(() => {
    if (billingid) {
      getResultSettings(setResultSettings, setLoader)
      customFetch(`result/printout/approved/test?billingid=${billingid}`)
        .then((data) => {
          settestList(data)
        })
        .catch((err) => {
          settestList([])
        })
    }
  }, [billingid])

  const handleCheck = (ev, item) => {
    const checked = ev.target.checked
    if (checked) {
      setPrintList([...toprintList, item])
    } else {
      const printList = [...toprintList]
      setPrintList(printList.filter((values, index) => values.testid != item.testid))
    }
  }
  return (
    <>
      <div className="multiple-result-out">
        <aside className="bg-dark">
          <div className="p-2">
            <button onClick={() => readyToPrint(billingid, testid)} className="btn btn-secondary w-100">
              <RiPrinterFill style={{ height: "100px", width: "100px" }} />
            </button>
          </div>
          <div className="list-group bg-white m-2">
            {testList.length === 0 ? (
              <Loader />
            ) : (
              testList.map((item, index) => {
                return (
                  <li key={index} className="list-group-item d-flex align-items-center">
                    <span>
                      {" "}
                      <Form.Check
                        onChange={(ev) => {
                          handleCheck(ev, item)
                        }}
                        style={{ fontSize: "25px", marginRight: "5px" }}
                      />
                    </span>
                    <span className="text-capitalize text-secondary"> {item.name}</span>
                  </li>
                )
              })
            )}
          </div>
        </aside>
        <main className="multiple-main">
          <div className="result_page">
            <div className="result">
              <div className="result-top-section">
                {resultsettings?.letterHeading == 1 && <CompanyHeaders billingid={billingid} />}
                <PersonalInformation patientid={patientid} billingid={billingid} />
                {resultsettings?.samplingInformation == 1 && <SamplingInformationResult billingid={billingid} testid={testid} />}
                <section style={{ borderTop: "1px solid black" }}>
                  <div style={{ borderBottom: "1px solid black" }}>
                    {toprintList.length === 0 ? (
                      <h4 className="alert alert-info">Check test to select</h4>
                    ) : (
                      toprintList.map((item, index) => {
                        return (
                          <UseCustomResultTemplating
                            key={index}
                            testid={item.testid}
                            test={formatTest(item.name)}
                            billingid={billingid}
                            patientid={patientid}
                          />
                        )
                      })
                    )}
                  </div>
                  <div>
                    <h5>Comments</h5>
                    {toprintList.map((item, index) => {
                      return <UseResultCommentSingle multiple={true} key={index} billingid={billingid} testid={item.testid} />
                    })}
                  </div>
                  <UseClinicalLiteratureReview testid={testid} />
                </section>
              </div>
              <div className="result-bottom-section">
                <UseResultEntryScientist testid={testid} billingid={billingid} />
                <UseDisclaimer patientid={patientid} />
                <VersionFooter />
              </div>
            </div>
            <div></div>
          </div>
        </main>
      </div>
    </>
  )
}
