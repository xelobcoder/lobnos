import { Container } from "react-bootstrap";
import UltrasoundLayout from "../../../../../components/Layout/ImagingLayout";
import { useContext, useEffect, useState } from "react";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import RulesLoadingTempleteCreation from "../../../../../components/operations/Ultrasound/RulesLoadingTempleteCreation";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../../../components/Layout/PrimeLayout";

export default function CreateUltrasonographyTemplates() {
	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const [ultrasoundList, setUltrasoundList] = useState([]);
	const [name, setName] = useState('');
	const [associatedbodypart, setBodyPart] = useState('');
	const [Visible, setVisible] = useState(1);
	const [isLoading, setLoading] = useState(true);
	const [rulesLoading, setRulesLoading] = useState(true);
	const [rule, setRule] = useState([]);
	const [impression, setImpression] = useState('');
	const [selectedTest, setSelectedList] = useState(null);

	const isEdit = useSearchParams().get("isEdit");
	const templateid = useSearchParams().get("templateid");

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


	const getTemplateDetails = async () => {
		try {
			setRulesLoading(true);
			const response = await customFetch(`testpanel/list/ultrasound/get/template?templateid=${templateid}`);
			const { fields, name, visibletoAll, associatedbodypart, testid } = response;
			setRule(fields);
			setName(name);
			setSelectedList(testid);
			setVisible(visibletoAll);
			setBodyPart(associatedbodypart);
			setRulesLoading(false);
			const impression = fields.find((item, index) => item.field === "impression");
			setImpression(impression?.value || "")
		} catch (err) {
			alert('Something wrong happened');
			setRule([]);
			setRulesLoading(false);
		}

	}

	useEffect(() => {
		fetchdata();
	}, []);


	useEffect(() => {
		if (selectedTest && (!templateid || !isEdit)) getCreationRule();
	}, [selectedTest])

	useEffect(() => {
		if (isEdit && templateid) getTemplateDetails();
	}, [isEdit, templateid])






	const handleFieldChange = (data, index) => {
		const previous = [...rule];
		previous[index]['value'] = data;
		setRule(previous);
	}


	const createTemplateHandler = async () => {
		const templateDetails = {
			employeeid,
			testid: parseInt(selectedTest),
			associatedbodypart,
			visibleToAll: Visible,
			fields: [...rule, { [templateid ? "field" : "name"]: "impression", value: impression }],
			keyid: templateid ? parseInt(templateid) : null,
			name
		}

		const response = await customPost(`result/entry/ultrasound/templates/creation`, (templateid && isEdit ? 'PUT' : 'POST'), templateDetails);

		const { status } = response;

		toast[status == true ? "success" : "error"](status ? `Template ${templateid ? "updated" : "created"} successfully` : `Template ${templateid ? "update" : "creation"} failed`)

	}


	if (isLoading) {
		return (<UltrasoundLayout> <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading Data.......................</div></UltrasoundLayout>)
	};


	return (
		<PrimeLayout>
			<Container fluid>
				<ToastContainer theme='colored' position="top-center" className="text-sm" />
				<div className="p-2">
					<div className="p-2 bg-secondary-subtle heightedBorder my-2 br-0">Creating Ultrasound Impression Templates</div >
					<form className="my-2 heightedBorder text-sm bg-body-secondary p-3 br-0">
						<div className="grid-reg my-2">
							<label>Name of Template</label>
							<input value={name} onChange={(ev) => { setName(ev.target.value) }} className="custom-input pls-color text-sm " name="" type="text" placeholder="Please type name of pathology or template here" />
						</div>
						<div className="grid-reg">
							<label>Ultrasound Scan</label>
							<select className="custom-select pls-color text-sm text-capitalize"
								value={selectedTest}
								disabled={templateid}
								onChange={(ev) => { setSelectedList(ev.target.value) }} >
								<option value={''}>Select an option here</option>
								{ultrasoundList.map((item, index) => <option key={index} value={item.id}>{item.name}</option>)}
							</select>
						</div>
						<div className="grid-reg my-2">
							<label>Associated Body Part</label>
							<select value={associatedbodypart} onChange={(ev) => { setBodyPart(ev.target.value) }} className="custom-select text-capitalize pls-color text-sm">
								<option value=''>select body part</option>
								<option value={'Kidney'}>Kidney</option>
								<option value={'Uterus'}>Uterus</option>
							</select>
						</div>
						<div className="grid-reg my-2">
							<label>Visible to all Sonographers</label>
							<select value={Visible} onChange={(ev) => { setVisible(ev.target.value) }} className="custom-select pls-color text-sm text-capitalize">
								<option value={1}>Yes</option>
								<option value={0}>No</option>
							</select>
						</div>
					</form>
					<RulesLoadingTempleteCreation
						rule={rule}
						impression={impression}
						setImpression={setImpression}
						selected={selectedTest}
						handleFieldChange={handleFieldChange}
						rulesLoading={rulesLoading}
					/>

					{rule.length > 0 && <button className="btn btn-primary btn-primary btn-sm" onClick={createTemplateHandler}>
						Save Template Information
					</button>}
				</div>
			</Container>
		</PrimeLayout>
	)
}