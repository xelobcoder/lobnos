import { useEffect, useState } from "react"
import ExpenseLayout from "../../components/Expense/ExpenseLayout"
import Loader from "../../components/accessories/Loader"
import { currencyFormatter, customFetch, updatePagination } from "../../components/Auth/customFetch"
import Image from "next/image"
import Pagination from "../../components/accessories/pagination"
import { List } from "@mui/icons-material"
import ExpenseRejectionModal from "./ExpenseRejectionModal"

export default function AdminExpensesList({ branchid, employeeid }) {
  const [detail, setDetails] = useState(true)
  const [selected, setSelected] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [selectedLoading, setSelectedLoading] = useState(false)
  const [imagefull, setImageFull] = useState(false)
  const [load, setLoad] = useState(false)
  const [page, setPage] = useState({ count: 10, page: 1 })
  const [showRmodal, setRmodal] = useState(false)

  useEffect(() => {
    if (employeeid && branchid) {
      customFetch(`expenses/records?branchid=${branchid}&&employeeid=${employeeid}&&count=${page.count}&&page=${page.page}`)
        .then((data) => {
          setExpenses(data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [branchid, employeeid, page])

  const updatePage = (value) => {
    updatePagination(value, setPage, page)
  }

  useEffect(() => {
    if (selected) {
      setSelectedLoading(true)
      customFetch(`expenses/record/single?expenseid=${parseInt(selected)}`)
        .then((data) => {
          data.length > 0 && setDetails(data[0])
        })
        .catch((err) => {
          setDetails(null)
        })
        .finally(() => {
          setSelectedLoading(false)
        })
    }
  }, [selected])

  useEffect(() => {
    if (expenses.length == 0) {
      setSelected(null)
    }
  }, [expenses.length])

  const viewSelected = () => {
    if (selectedLoading) {
      return <Loader />
    } else {
      if (selected) {
        return (
          <>
            <div className="d-flex justify-content-end mb-1 mx-2">
              {detail?.approved == 0 && (
                <span className="text-warning bg-warning text-white border-warning border p-2"> AWAITING APPROVAL</span>
              )}
              {detail?.approved == 2 && <span className="text-danger bg-danger text-white border-danger border p-2">EXPENSE REJECTED</span>}
              {detail?.approved == 1 && <span className="text-success p-2 border-success border">EXPENSE APPROVED</span>}
            </div>
            <div className="border border-secondary-subtle p-2 grid grid-50 mx-2">
              <span>Title:{detail?.name}</span>
              <span>ID:EXP{detail?.id}</span>
              <span>
                Expense date: {new Date(detail?.date).toLocaleDateString()} {new Date(detail?.date).toLocaleTimeString()}
              </span>
              <span>
                Loggedon:
                {new Date(detail?.createdon).toLocaleDateString()} {new Date(detail?.createdon).toLocaleTimeString()}
              </span>
              <span>Amount: {currencyFormatter.format(detail?.amount)}</span>
              <span>ApprovedOn: {detail?.approved == 1 ? detail.approvedon : "N/A"}</span>
            </div>
            <div className="mx-2 mt-2">
              <h6>Description</h6>
              <p className="bg-secondary-subtle br-5 p-3">{detail?.description}</p>
            </div>
            <div className="mx-2">
              <div className="d-flex justify-content-between">
                <h6>Receipts</h6>
                <List
                  fontSize="large"
                  onClick={(ev) => {
                    setImageFull(!imagefull)
                  }}
                />
              </div>
              {detail?.images && detail?.images.length == 0 && "No receipts uploaded"}
              {detail?.images && detail.images.length > 0 && (
                <div className={imagefull ? "grid " : "grid-30-30-30"}>
                  {detail.images.map((item, index) => {
                    const url = `${process.env.BASEURL}/expenses/receipt/upload/images?imageid=${item}`
                    return (
                      <Image
                        key={index}
                        alt="expense receipt"
                        className={imagefull ? "mb-3 container " : ""}
                        height={imagefull ? "600" : "300"}
                        onClick={(ev) => {
                          window.open(url)
                        }}
                        width={imagefull ? "1000" : "300"}
                        src={url}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )
      }
    }
  }

  const showRejectionModal = (ev) => {
    setRmodal(true)
  }

  const closeRmodal = (ev) => setRmodal(false)

  return (
    <ExpenseLayout>
      {/* {renderingView()} */}
      <div
        style={{
          minHeight: "100vh",
          maxHeight: "max-content",
          backgroundColor: "white",
          display: "grid",
          gridTemplateColumns: `${selected ? "25% auto" : "100%"}`,
        }}>
        <section style={{ borderRight: "1px solid lightgray" }}>
          <div className="d-block p-1">
            <input type="date" className="custom-input" />
            <input type="date" className="custom-input mt-2" />
            <select className="custom-select mt-2">
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="requested">requested</option>
            </select>
            <button className="btn btn-primary btn-sm mt-2">search</button>
          </div>
          <div>
            {expenses.length == 0 ? (
              <div className="bg-secondary-subtle p-3 br-5">
                <h4>No Data Found</h4>
              </div>
            ) : (
              expenses.map((item, index) => {
                return (
                  <div
                    onClick={(ev) => {
                      setSelected(item?.id)
                    }}
                    key={index}
                    className={`border-bottom p-3 pointer ${selected == item?.id ? "expense-admin-li" : ""}`}>
                    <div className="d-flex justify-content-between">
                      <span className="text-capitalize" style={{ fontSize: "18px" }}>
                        {item?.name}
                      </span>
                      <span className="text-secondary text-lead">{currencyFormatter.format(item.amount)}</span>
                    </div>
                    <div className="mt-2 d-flex justify-content-between">
                      <div className="text-capitalize">
                        Requested By:
                        <span className="mx-2">{item.username}</span>
                      </div>
                      <div>
                        {item.approved == 0 && <span className="text-warning border-warning border"> PENDING</span>}
                        {item.approved == 2 && <span className="text-danger border-danger border">REJECTED</span>}
                        {item.approved == 1 && <span className="text-success border-success border">APPROVED</span>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="d-flex justify-content-end mt-2 mx-2">
            <Pagination updateFunction={updatePage} page={page.page} load={setLoad} />
          </div>
        </section>

        {selected && (
          <section className="pointer">
            {detail.approved == 0 && (
              <div className="d-flex justify-content-end border-bottom p-2">
                <button className="btn  btn-sm btn-success">Approve</button>
                <button
                  onClick={(ev) => {
                    showRejectionModal(ev)
                  }}
                  className="btn btn-sm  btn-danger mx-2 ">
                  Reject
                </button>
              </div>
            )}
            <div>{viewSelected()}</div>
          </section>
        )}
      </div>
      {showRmodal && <ExpenseRejectionModal show={showRmodal} hide={closeRmodal} />}
    </ExpenseLayout>
  )
}
