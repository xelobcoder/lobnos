'use client'

import React, { useState } from "react"
import { customFetch } from "../../components/Auth/customFetch"

export default function Page() {
  const [searchString, setSearchString] = useState("")
  const [data, setData] = useState<any[]>([])

  // Load results
  const loadData = async (query: string) => {
    const response = await customFetch(
      `testpanel/list/bulk?searchstring=${query}&&filtercategory=name`
    )

    const { data, status } = response

    if (status === "success" && Array.isArray(data)) {
      setData(data)
    } else {
      setData([])
    }
  }

  // Send selection back to parent
  const selectItem = (item: any) => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "TEST_PANEL_SELECTED",
          payload: item,
        },
        "*"
      )
    }

    window.close()
  }

  return (
    <div className="p-3">

      {/* Search Input */}
      <input
        className="form-control mb-2"
        placeholder="Search test name..."
        value={searchString}
        onChange={(e) => {
          const value = e.target.value
          setSearchString(value)

          if (value.length > 2) {
            loadData(value)
          } else {
            setData([])
          }
        }}
      />

      {/* Results */}
      <div className="list-group">
        {data.map((item, idx) => (
          <button
            key={idx}
            className="list-group-item list-group-item-action py-1"
            onClick={() => selectItem(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}
