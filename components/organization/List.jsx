import { useState, useEffect, useCallback } from "react"
import TableDisplay from "../../components/accessories/TableDisplay"
import { customFetch, deleteOrganization, handleChangeWithState, updatePagination } from "../Auth/customFetch"
import { IconButton } from "@mui/material"
import { DeleteOutlineOutlined, Edit } from "@mui/icons-material"
import { useRouter } from "next/router"
import Pagination from "../../components/accessories/pagination"
import Loader from "../../components/accessories/Loader"


export default function OrganizationList() {
  const [organization, setOrganization] = useState([])
  const [paginate, setPaginate] = useState({ count: 10, page: 1 })
  const [filter, setFilter] = useState({ organization: "", email: "", contact: "" })
  const [load, setLoad] = useState(false)
  const [isloading, setLoading] = useState(true)
  const router = useRouter()

  const handleEditing = async (id) => {
    router.push(`/organization/${id}/basicinfo`)
  }

  const columns = [
    {
      Header: "organization",
      accessor: "name",
    },
    {
      Header: "Location",
      accessor: "location",
    },
    {
      Header: "Contact",
      accessor: "mobile",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Region",
      accessor: "region",
    },
    {
      Header: "address",
      accessor: "address",
    },
    {
      Header: "action",
      accessor: "viewmore",
      Cell: ({ row }) => {
        return (
          <span>
            <IconButton
              edge="start"
              size="small"
              sx={{ color: "blue" }}
              onClick={(ev) => {
                handleEditing(row.original.id)
              }}>
              <Edit />
            </IconButton>
            <IconButton
              edge="start"
              size="small"
              sx={{ color: "red" }}
              onClick={(e) => deleteOrganization(row.original.ID, getOrganizationData)}>
              <DeleteOutlineOutlined />
            </IconButton>
          </span>
        )
      },
    },
  ]

  const getOrganizationData = useCallback(
    function (endpoint) {
      let loadurl = endpoint ? endpoint : `organizations/details?count=${paginate.count}&&page=${paginate.page}&&contact=${filter.contact}&&email=${filter.email}&&organization=${filter.organization}`
      setLoading(true);
      customFetch(loadurl)
        .then((response) => {
          const { statusCode, status, result } = response
          statusCode == 200 && status == "success" ? setOrganization(result) : setOrganization([])
          setLoading(false)
        })
        .catch((err) => {
          setOrganization([])
          setLoading(false)
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginate]
  )

  useEffect(() => {
    getOrganizationData()
  }, [getOrganizationData])

  const ListRenderingView = () => {
    if (isloading) return <Loader />
    else return <TableDisplay showpage={false} column={columns} data={organization} />
  }

  const updatePageValue = async (value) => {
    updatePagination(value, setPaginate, paginate)
  }

  const filterButton = async () => {
    let original = `organizations/details?count=${paginate.count}&&page=${paginate.page}`
    let url = ""
    for (const [key, value] of Object.entries(filter)) {
      url += `&&${key}=${value}`
    }
    original += url
    getOrganizationData(original)
  }

  return (
    <section>
      <div className="d-flex justify-content-between">
        <h4>Advance Search</h4>
        <div>
          <button
            onClick={(ev) => {
              router.push("/organization/new")
            }}
            className="btn btn-primary btn-sm">
            add new organization
          </button>
        </div>
      </div>
      <form className="grid grid-4">
        <div className="form-row">
          <input
            value={filter.organization}
            onChange={(ev) => {
              handleChangeWithState(ev, "organization", setFilter, filter)
            }}
            className="custom-input"
            type="text"
            placeholder="organization name"
          />
        </div>
        <div className="form-row  mx-2">
          <input
            value={filter.email}
            onChange={(ev) => {
              handleChangeWithState(ev, "email", setFilter, filter)
            }}
            className="custom-input"
            type="email"
            placeholder="email"
          />
        </div>
        <div className="form-row mx-2">
          <input
            value={filter.contact}
            onChange={(ev) => {
              handleChangeWithState(ev, "contact", setFilter, filter)
            }}
            className="custom-input"
            type="tel"
            minLength={10}
            maxLength={10}
            placeholder="contact number"
          />
        </div>
        <div>
          <button
            onClick={(ev) => {
              filterButton()
            }}
            type="button"
            className="btn btn-secondary bt-sm mx-3">
            search
          </button>
        </div>
      </form>
      {ListRenderingView()}
      <div className="d-flex justify-content-center  mt-3">
        <Pagination updateFunction={updatePageValue} load={setLoad} />
      </div>
    </section>
  )
}
