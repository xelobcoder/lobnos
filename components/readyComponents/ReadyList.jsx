import TableDisplay from '../accessories/TableDisplay';
import { EnergySavingsLeaf } from "@mui/icons-material";
import Pagination from '../../components/accessories/pagination';

export default function ReadyList({ readydata, page, showAccord, updateAccord, updatePagination, load = false }) {
  let columns = [
    { Header: "billingid", accessor: "billingid" },
    { Header: "fullname", accessor: "fullname" },
    { Header: "undrawn samples", accessor: "undrawnsamples" },
    { Header: "processing", accessor: "processing" },
    {
      Header: "completed",
      accessor: "completed",
      Cell: ({ row }) => {
        const item = row.original
        return (
          <span>
            {item?.completed}/{item?.testcount}
          </span>
        )
      },
    },
    {
      Header: "approved",
      accessor: "approved",
      Cell: ({ row }) => {
        const item = row.original
        return (
          <span>
            {item?.approved}/{item?.testcount}
          </span>
        )
      },
    },
    {
      Header: "action",
      accessor: "action",
      Cell: ({ row }) => {
        const item = row.original
        return (
          <span>
            <button
              className="btn btn-success btn-sm"
              onClick={(e) => {
                updateAccord(item)
              }}>
              view tests
              <EnergySavingsLeaf />
            </button>
          </span>
        )
      },
    },
  ]

  if (showAccord.display) {
    columns = [
      { Header: "billingid", accessor: "billingid" },
      { Header: "fullname", accessor: "fullname" },
      {
        Header: "action",
        accessor: "action",
        Cell: ({ row }) => {
          const item = row.original
          return (
            <span>
              <button
                className="btn btn-success btn-sm"
                onClick={(e) => {
                  updateAccord(item)
                }}
                view
                tests>
                <EnergySavingsLeaf /> view Test
              </button>
            </span>
          )
        },
      },
    ]
  }

  return (
    <div>
      <TableDisplay filtering={!showAccord.display} column={columns} data={readydata} showpage={false} />
      <div className="d-flex justify-content-center">
        <Pagination page={page} updateFunction={updatePagination} load={load} />
      </div>
    </div>
  )
}
