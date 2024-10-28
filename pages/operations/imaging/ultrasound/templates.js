import { Container } from "react-bootstrap";
import UltrasoundLayout from "../../../../components/Layout/ImagingLayout";
import { useEffect, useState } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import dynamic from "next/dynamic";
import RulesLoadingTempleteCreation from "../../../../components/operations/Ultrasound/RulesLoadingTempleteCreation";
const MARKDOWN_EDITOR = dynamic(() => import('../../../../components/accessories/markdownEditor'), { ssr: false })



export default function CreateUltrasonographyTemplates() {
	const [ultrasoundList, setUltrasoundList] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [rulesLoading, setRulesLoading] = useState(true);
	const [rule, setRule] = useState([]);
	const [impression, setImpression] = useState('');
	const [selectedTest, setSelectedList] = useState(null);

	const fetchdata = async function () {
		try {
			setLoading(true)
			const data = await customFetch(`testpanel/list/ultrasound`);
			setUltrasoundList(data);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			setUltrasoundList([]);
		}
	}

	const getCreationRule = async function () {
		try {
			setRulesLoading(true);
			const rule = await customFetch(`testpanel/list/customtestrule?testid=${selectedTest}`);
			setRule(rule);
			setRulesLoading(false);
		} catch (err) {
			alert('Something wrong happened');
			setRule([]);
			setRulesLoading(false);
		}
	
	}

	useEffect(() => { fetchdata() }, []);


	useEffect(() => {
		if (selectedTest) getCreationRule();
	}, [selectedTest])



	const handleFieldChange = (data, index) => {
		const previous = [...rule];
		previous[index]['value'] = data;
		setRule(previous);
	}


	if (isLoading) {
		return (<UltrasoundLayout> <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading Data.......................</div></UltrasoundLayout>)
	};



	return (
		<UltrasoundLayout>
			<Container fluid>
				<div className="p-2">
					<div className="p-2 bg-secondary-subtle heightedBorder my-2 br-0">Creating Ultrasound Impression Templates</div >
					<form className="my-2 heightedBorder text-sm bg-body-secondary p-3 br-0">
						<div className="grid-reg my-2">
							<label>Name of Template</label>
							<input className="custom-input pls-color text-sm " name="" type="text" />
						</div>
						<div className="grid-reg">
							<label>Ultrasound Scan</label>
							<select className="custom-select pls-color text-sm text-capitalize" onChange={(ev) => { setSelectedList(ev.target.value) }} >
								<option value={''}>Select an option here</option>
								{ultrasoundList.map((item, index) => <option value={item.id}>{item.name}</option>)}
							</select>
						</div>
						<div className="grid-reg my-2">
							<label>Visible to all Sonographers</label>
							<select className="custom-select pls-color text-sm text-capitalize">
								<option value={1}>Yes</option>
								<option value={0}>No</option>
							</select>
						</div>
					</form>
					<RulesLoadingTempleteCreation rule={rule} impression={impression} setImpression={setImpression} handleFieldChange={handleFieldChange} rulesLoading={rulesLoading} />
				</div>
			</Container>
		</UltrasoundLayout>
	)
}