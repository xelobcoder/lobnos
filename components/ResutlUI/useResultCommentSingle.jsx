import { useEffect, useState, useRef } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"
export default function UseResultCommentSingle({ testid, billingid }) {
  const [comments, setComments] = useState("")
  const [isloading, setLoading] = useState(true)
  const commentsRef = useRef()

  useEffect(() => {
    if (billingid && testid) {
      setLoading(true)
      customFetch(`testpanel/list/customtestrule/previous/comments?billingid=${billingid}&&testid=${testid}`)
        .then((data) => {
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

  useEffect(() => {
    if (commentsRef.current) {
      console.log(commentsRef.current)
      commentsRef.current.dangerouslySetHtml;
    }
  }, [comments])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return <div ref={commentsRef}>{comments}</div>
    }
  }

  return (
    <section>
      <h5>Comments</h5>
      {renderingView()}
    </section>
  )
}
