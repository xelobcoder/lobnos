import { useState } from "react"
import ISLOADING from "../../isLoading";

export default function RackListView({ id, name }) {
  const [loading, setLoading] = useState(true);
  return (
    <div className="card  mx-2 my-2">
      <div className="card-header text-sm modal-color text-capitalize">
        {name}
      </div>
      <div className="card-body br-0">
          {loading && <ISLOADING/>}
      </div>
    </div>
  )
}