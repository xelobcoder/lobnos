import { useRouter } from "next/navigation"
export default function ImagingSidebar() {
  const router = useRouter()

  const handleRouter = (link) => {
    router.push(link)
  }
  return (
    <>
      <div className="d-flex justify-content-between mx-2 mb-1">
        <button
          onClick={() => {
            handleRouter("/operations/imaging/ultrasound/waitinglist")
          }}
          className="btn btn-primary btn-sm mt-1">
          client queue
        </button>
        <button
          onClick={() => {
            handleRouter("/operations/imaging/ultrasound/processedlist")
          }}
          className="btn btn-warning  mt-1">
          processed scan reports
        </button>
      </div>
    </>
  )
}
