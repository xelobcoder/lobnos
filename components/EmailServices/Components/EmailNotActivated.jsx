import { useRouter } from "next/navigation"
import Authorization from "../../accessories/authorization"

export default function EmailServiceNotActivated() {
  const router = useRouter()
  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h5 className="border text-capitalize border-2 border-dark mt-5">
          Email services not activated
        </h5>
        <Authorization />
        <button
          className="btn btn-dark"
          onClick={(ev) => {
            router.push("/settings/applicationsettings")
          }}>
          visit application settings page to activate
        </button>
      </div>
    </div>
  )
}