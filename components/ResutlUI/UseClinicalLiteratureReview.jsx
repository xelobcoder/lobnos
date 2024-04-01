import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"

export default function UseClinicalLiteratureReview({ testid }) {
  const [isloading, setLoading] = useState(true)
  const [literature, setLiterature] = useState("")

  useEffect(() => {
    if (testid) {
      setLoading(true)
      customFetch(`test/isLiteraturereview/getLiterature?testid=${testid}`)
        .then((data) => {
          const { can, literature } = data
          setLiterature(literature)
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }
  }, [testid])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div>
          <h6>Clinical Notes</h6>
          {literature}
        </div>
      )
    }
  }

  return <section>{renderingView()}</section>
}
