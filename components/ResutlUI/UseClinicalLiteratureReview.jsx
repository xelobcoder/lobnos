import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"

export default function UseClinicalLiteratureReview({ testid }) {
  const [isloading, setLoading] = useState(true)
  const [literature, setLiterature] = useState("")
  const [canLit, setCanLit] = useState(false)

  useEffect(() => {
    if (testid) {
      setLoading(true)
      customFetch(`test/isLiteraturereview/getLiterature?testid=${testid}`)
        .then((data) => {
          const { can, literature } = data
          setCanLit(can)
          setLiterature(literature)
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }
  }, [testid])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      if (canLit) {
        return (
          <div>
            <h6>Clinical Notes</h6>
            <div dangerouslySetInnerHTML={{__html: literature}}/>
          </div>
        )
      } else {
        return
      }
    }
  }

  return <section>{renderingView()}</section>
}
