import { useState, useEffect } from "react";
import Loader from "../../accessories/Loader";
import HasLimitReference from "./hasLimitsReference";
import { customFetch } from "../../Auth/customFetch";


interface UseCustomResultTemplatingProps {
	billingid: string;
	testid: string;
	test: string;
	patientid: string;
}

interface ResultItem {
	haslimits: boolean;
	useplain: boolean;
	name: string;
	value: string;
	units?: string;
	lowerlimit?: string;
	upperlimit?: string;
	plain?: string;
}

export default function UseCustomResultTemplating({ billingid, testid, test, patientid }: UseCustomResultTemplatingProps) {
	const [haslimits, setHaslimits] = useState<boolean>(true)
	const [result, setResult] = useState<ResultItem[]>([])
	const [isloading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		try {
			const getData = async () => {
				if (billingid && test && testid) {
					setLoading(true)
					const response = await customFetch(`result/preview?billingid=${billingid}&&testid=${testid}&&test=${test}`)
					const { result, sampling, testcategory } = response as { result: ResultItem[], sampling?: any, testcategory?: any }
					if (result.length > 0) {
						const haslimits = result.some((item) => item.haslimits == true)
						setHaslimits(haslimits)
					} else {
						setHaslimits(false)
					}
					setResult(result || [])
					setLoading(false)
				}
			}
			getData()
		} catch (err) {
			setResult([])
			setLoading(false)
		}
	}, [billingid, test, testid, patientid])

	const renderingView = () => {
		if (isloading) return <Loader />
		else {
			if (!Array.isArray(result) || result.length == 0) return <h4>No data provided</h4>
			else {
				const hasLimits = result.some((item) => item.haslimits == true)
				const hasPlain = result.some((item) => item.useplain == true)

				if (hasLimits) {
					return (
						<>
							<h5 className="text-uppercase ui text-center border-bottom  border-2 border-secondary">
								<span className="fw-bold">
									{test && test.includes("_") ? test.split("_").join(" ") : test}
								</span>
							</h5>
							<table className="alpha-result-table ui" >
								<thead >
									<tr>
										<th colSpan={2}>Parameter</th>
										<th scope="col">Value</th>
										<th scope="col">Units</th>
										<th scope="col">References</th>
										<th>Flags</th>
									</tr>
								</thead>
								<tbody>
									{result.map((item, index) => {
										return <HasLimitReference key={index} item={item} />
									})}
								</tbody>
							</table>
						</>
					)
				} else if (hasPlain) {
					return (
						<>
							<h5 className="text-uppercase text-center ui border-bottom border-top border-2 border-secondary">
								{test && test.includes("_") ? test.split("_").join(" ") : test}
							</h5>
							<table className="alpha-result-table" >
								<thead >
									<tr>
										<th colSpan={2}>Parameter</th>
										<th>Value</th>
										<th>Units</th>
										<th>References</th>
									</tr>
								</thead>
								<tbody>
									{result.map((item, index) => {
										return <HasLimitReference key={index} item={item} />
									})}
								</tbody>
							</table>
						</>
					)
				} else {
					return (
						<>
							<h5 className="text-uppercase ui text-center border-bottom  border-2 border-secondary">
								<span className="fw-bold">{test && test.includes("_") ? test.split("_").join(" ") : test}</span>
							</h5>
							<table className="alpha-result-table ui">
								<thead className="">
									<tr>
										<th className="text-capitalize"> test</th>
										<th className="text-capitalize"> result</th>
									</tr>
								</thead>
								<tbody>
									{result.map((item, index) => {
										return (
											<tr key={index}>
												<td>{item.name}</td>
												<td>{item.value}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</>
					);
				}
			}
		}
	}

	return (
		<div>
			<section className="main-result">{renderingView()}</section>
		</div>
	)
}