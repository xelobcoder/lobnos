import { useRouter } from "next/navigation"

export default function EmailServiceNotActivated() {
  const router = useRouter();
  return (
    <div className="bg-white mx-3 my-3 br-5 py-5 px-4">
      <div className="text-center">
        <h1 className="text-2xl text-primary  font-bold">Email Service Not Activated</h1>
        <p className="text-sm">
          <button className="btn btn-primary" onClick={(ev) => {router.push('/settings')}}>
             Click here to activate email service
          </button>
        </p>
        </div>
    </div>
  )
}