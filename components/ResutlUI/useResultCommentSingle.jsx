import { useEffect, useState } from "react"
import { customFetch, generateRandomTextAndNumbers } from "../Auth/customFetch"
import Loader from "../accessories/Loader"
export default function UseResultCommentSingle({ testid, billingid, patientid, multiple = false }) {
	const [comments, setComments] = useState("")
	const [isloading, setLoading] = useState(true)

	useEffect(() => {
		if (billingid && testid) {
			setLoading(true);
			const csvid = generateRandomTextAndNumbers(70) + billingid;
			const ptid = generateRandomTextAndNumbers(50) + patientid;
			customFetch(`testpanel/list/customtestrule/previous/comments?csvid=${csvid}&&testid=${testid}&&ptid=${ptid}&&target=70,50`)
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

	const renderingView = () => {
		if (isloading) return <Loader />
		else {
			return <div style={{ fontSize: '15px' }}  dangerouslySetInnerHTML={{ __html: comments }} />
		}
	}

	return (
		<div>
			{comments && comments.length > 0 &&  <h5>Comments</h5>}
			{renderingView()}
			
			<hr className="p-0 "/>
			<span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
		</div>
	)
}
