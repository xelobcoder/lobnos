import Image from 'next/image'
import { useState } from "react"
export default function NotSelected({ len = 0 }) {
  const [isempty, setEmpty] = useState(len === 0)
  return (
    <>
      {len && (
        <div className="p-3 bg-white text-primary br-5">
          <h6>Search with a valid client unique identity number to continue</h6>
        </div>
      )}
    </>
  )
}
