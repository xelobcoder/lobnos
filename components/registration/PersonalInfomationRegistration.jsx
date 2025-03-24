"use client"
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { customFetch, customPost } from "../Auth/customFetch";
import { designation } from "./fields/Util";
import PersonalRegistrationForms from "./PersonalRegistrationForms/PersonalRegistrationForms";
import AdditionalPersonalInformation from "./PersonalRegistrationForms/AdditionalPersonalInformation";
import { handleAgeCalculations } from "../Auth/registerclient";
import { buildPersonalInformationSchema } from "./validationSchema";


export default function PersonalInformationRegistration({
	defaultData,
	fields,
	toast,
	patientid,
	redirect = false,
}) {
	const [isLoading, setIsLoading] = useState(false);
	const dynamicSchema = buildPersonalInformationSchema(fields);

	const methods = useForm({
		defaultValues: defaultData,
		resolver: yupResolver(dynamicSchema),
	});
	const { handleSubmit, reset } = methods;

	useEffect(() => {
		reset(defaultData);
	}, [patientid, reset, defaultData]);



	const onSubmit = async (formData) => {
		
		try {
			const method = patientid ? "PUT" : "POST";
			const endpoint =
				method === "POST"
					? "register"
					: `register/personalinformation?patientid=${formData?.patientid}`;
			const response = await customPost(endpoint, method, {
				data: {
					...formData, mobileownership: formData?.contactpointer == true ? "relative" : "self"
				}
			});
			const { message, patientid: newPatientId } = response;

			if (response?.status == true || response?.status === "success") {
				const toastMessage = redirect
					? `${message}. Redirecting to billing page`
					: message;
				toast.success(toastMessage || "updating record sucessfully");
				if (redirect &&  redirect == true) {
					setTimeout(() => {
						window.location.href = `/billing/patientid?patientid=${newPatientId}`;
					}, 1500);
				}
			} else {
				toast.error(message, { autoClose: 1000 });
			}
		} catch (error) {
			toast.error("An error occurred while submitting the form")
			console.error("Submission error", error);
		}
	};


	const checkIFNumberisAvailable = async (value, setState) => {
		try {
			const checking = await customFetch(`register/checkmobile?mobileno=${value}`);
			setState(checking?.exist)
		} catch (err) {
			setState(false);
		}
	}

	if (isLoading) {
		return <div>Loading data...</div>;
	}

	return (
		<section className="col-lg-12 col-sm-12">
			<FormProvider {...methods}>
				<form
					autoComplete="off"
					noValidate
					autoCorrect="false"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div>
						<PersonalRegistrationForms
							toast={toast}
							handleAgeCalculations={handleAgeCalculations}
							fields={fields}
							designation={designation}
						/>
						<AdditionalPersonalInformation
							checkIFNumberisAvailable={checkIFNumberisAvailable}
							fields={fields} patientid={patientid} />
					</div>
				</form>
			</FormProvider>
		</section>
	);
}
