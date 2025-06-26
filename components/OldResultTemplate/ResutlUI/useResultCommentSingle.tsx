import { useState, useEffect } from "react";
import Loader from "../../accessories/Loader";
import { customFetch } from "../../Auth/customFetch";


interface UseResultCommentSingleProps {
  testid: string;
  billingid: string;
  multiple?: boolean;
}

export default function UseResultCommentSingle({ testid, billingid, multiple = false }: UseResultCommentSingleProps) {
  const [comments, setComments] = useState<string>("")
  const [isloading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (billingid && testid) {
      setLoading(true)
      customFetch(`testpanel/list/customtestrule/previous/comments?billingid=${billingid}&&testid=${testid}`)
        .then((data: { comments?: string }) => {
          const { comments } = data
          comments && setComments(comments)
          setLoading(false)
        })
        .catch((err) => {
          setLoading(false)
          setComments("")
        })
    }
  }, [billingid, testid])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return <div style={{fontSize:'15px'}} dangerouslySetInnerHTML={{ __html: comments }} />
    }
  }

  return (
    <section className="mt-2">
      {renderingView()}
    </section>
  )
}