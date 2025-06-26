import { useState, useEffect } from "react";
import Loader from "../../accessories/Loader";
import { customFetch } from "../../Auth/customFetch";



interface UseClinicalLiteratureReviewProps {
  testid: string;
}

export default function UseClinicalLiteratureReview({ testid }: UseClinicalLiteratureReviewProps) {
  const [isloading, setLoading] = useState<boolean>(true)
  const [literature, setLiterature] = useState<string>("")
  const [canLit, setCanLit] = useState<boolean>(false)

  useEffect(() => {
    if (testid) {
      setLoading(true)
      customFetch(`test/isLiteraturereview/getLiterature?testid=${testid}`)
        .then((data: { can?: boolean, literature?: string }) => {
          const { can, literature } = data
          setCanLit(can || false)
          setLiterature(literature || "")
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
        return null
      }
    }
  }

  return <section>{renderingView()}</section>
}