import { useState, useEffect, useCallback } from "react"
import { customFetch, deleteOrganization, handleChangeWithState, updatePagination } from "../Auth/customFetch"
import { 
  RiEditLine, 
  RiDeleteBinLine, 
  RiSearchLine,
  RiAddLine,
  RiFilterLine,
  RiBuildingLine,
  RiMailLine,
  RiPhoneLine 
} from '@remixicon/react';
import { useRouter } from 'next/navigation'
import PrimeTable from "../accessories/Datatables/PrimeTable";


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
            <RiEditLine color="red" onClick={(ev) => { handleEditing(row.original.id) }} />
            <RiDeleteBinLine onClick={(e) => deleteOrganization(row.original.ID, getOrganizationData)} />
          </span>
        )
      },
    },
  ]

  const getOrganizationData =
    function () {
      let loadurl = `organizations/details?count=${paginate.count}&&page=${paginate.page}&&contact=${filter.contact}&&email=${filter.email}&&organization=${filter.organization}`
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
    }

  useEffect(() => {
    getOrganizationData()
  }, [])


  const updatePageValue = async (value) => {
    updatePagination(value, setPaginate, paginate)
  }

  const filterButton = async () => {
    let original = `organizations/details?count=${paginate.count}&&page=${paginate.page}`
    let url = ""
    for (const [key, value] of Object.entries(filter)) {
      if (value) { // Only add non-empty values to filter
        url += `&&${key}=${value}`
      }
    }
    original += url
    getOrganizationData() // Enable the function call
  }
  if (isloading) return <div>loading ........... </div>
  return (
    <section>
      <div className="d-flex justify-content-between">
       
        
      </div>
      <form className="grid grid-5">
        <div className="form-row">
          <div className="input-group">
            <span className="input-group-text">
              <RiBuildingLine size={20} />
            </span>
            <input
              value={filter.organization}
              onChange={(ev) => {
                handleChangeWithState(ev, "organization", setFilter, filter)
              }}
              className="form-control"
              type="text"
              placeholder="organization name"
            />
          </div>
        </div>
        <div className="form-row ">
          <div className="input-group">
            <span className="input-group-text">
              <RiMailLine size={20} />
            </span>
            <input
              value={filter.email}
              onChange={(ev) => {
                handleChangeWithState(ev, "email", setFilter, filter)
              }}
              className="form-control"
              type="email"
              placeholder="email"
            />
          </div>
        </div>
        <div className="form-row ">
          <div className="input-group">
            <span className="input-group-text">
              <RiPhoneLine size={20} />
            </span>
            <input
              value={filter.contact}
              onChange={(ev) => {
                handleChangeWithState(ev, "contact", setFilter, filter)
              }}
              className="form-control"
              type="tel"
              minLength={10}
              maxLength={10}
              placeholder="contact number"
            />
          </div>
          
        </div>
        
        <div>
          <button
            onClick={(ev) => {
              ev.preventDefault();
              filterButton()
            }}
            type="button"
            className="btn btn-secondary bt-sm mx-3 d-flex align-items-center">
            <RiSearchLine className="me-2" size={20} />
            search
          </button>
        </div>
        <div className="form-row">
          <button
            onClick={(ev) => {
              router.push("/organization/new")
            }}
            className="btn btn-primary  d-flex align-items-center">
            <RiAddLine className="me-2" size={20} />
            add new organization
          </button>
        </div>
      </form>
      <PrimeTable
        column={columns} data={organization}
        filtering={false}
        serverSideFiltering={true}
        rowClassName={()=> {}}
        handleSeverSideProcessing={null}
      />
    </section>
  )
}
