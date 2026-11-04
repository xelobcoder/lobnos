"use client";
import { useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../../../../components/Auth/customFetch";
import Link from "next/link";
import ShowTableCount from "../../../../../../components/operations/Laboratory/ShowCountTable";
import { useApplicationSettings } from "../../../../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import Loader from "../../../../../../components/accessories/Loader";
import { toast } from "react-toastify";


interface TemplateItem {
	name: string;
	ultrasoundname: string;
	associatedbodypart: string;
	createdOn: string;
	visibletoAll: boolean;
	keyid: number;
	createdby: number;
}

export default function UltrasoundTemplatesList() {
	const { applicationsettings } = useApplicationSettings();
	const { employeeid, role } = applicationsettings.user;
	const canManageAll = ["admin", "manager", "superadmin"].includes(String(role || "").toLowerCase().replace(/[\s_-]/g, ""));

	const [isLoading, setLoading] = useState(true);
	const [templateList, setTemplateList] = useState<TemplateItem[]>([]);
	const [query, setQuery] = useState({ count: 10, page: 1 });
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const fetchData = useCallback(async () => {
		if (!employeeid) return;
		try {
			setLoading(true);
			setError(null);
			const data = await customFetch(
				`result/entry/ultrasound/templates/list?page=${query.page}&count=${query.count}&employeeid=${employeeid}`
			);
			if (!Array.isArray(data)) {
				throw new Error("The template list response was invalid.");
			}
			setTemplateList(data);
		} catch (err) {
			console.error("Error fetching ultrasound templates:", err);
			setError("Unable to load ultrasound templates. Try again.");
			setTemplateList([]);
		} finally {
			setLoading(false);
		}
	}, [employeeid, query]);

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	const deleteTemplate = async (template: TemplateItem) => {
		if (deletingId !== null) return;
		if (!window.confirm(`Delete the template "${template.name}"? Its report fields will be removed. Existing patient reports will not be changed.`)) return;
		setDeletingId(template.keyid);
		try {
			const response = await customFetchMutation(`result/entry/ultrasound/templates/${template.keyid}`, "DELETE", undefined);
			if (response?.status !== "success" || response.result?.deleted !== true || response.result?.templateId !== template.keyid) {
				throw new Error(response?.message || response?.error || "The server did not confirm template deletion.");
			}
			setTemplateList(current => current.filter(item => item.keyid !== template.keyid));
			toast.success("Ultrasound template deleted. Existing patient reports were not changed.");
		} catch (failure) {
			toast.error(failure instanceof Error ? failure.message : "Unable to delete the ultrasound template.");
		} finally {
			setDeletingId(null);
		}
	};

	const columns = [
		{
			Header: 'Name',
			accessor: 'name',
		},
		{
			Header: "Ultrasound Name",
			accessor: 'ultrasoundname'
		},
		{
			Header: 'Body Part',
			accessor: 'associatedbodypart',
		},
		{
			Header: 'Created On',
			accessor: 'createdOn',
			Cell: ({ value }: {value: TemplateItem["createdOn"]}) => new Date(value).toLocaleString(),
		},
		{
			Header: 'Visibility',
			accessor: 'visibletoAll',
			Cell: ({ value }: {value: TemplateItem["visibletoAll"]}) => (
				<span className="fw-semibold">{value ? "Visible to all" : "Restricted"}</span>
			),
		},
		{
			Header: 'Actions',
			accessor: 'keyid',
			Cell: ({ value, row }: {row: {original: TemplateItem; index: number}; value: TemplateItem["keyid"]}) => (
				<div className="d-flex align-items-center gap-2">
					<Link href={`/operations/imaging/ultrasound/templates?isEdit=true&templateid=${value}`} className="underline">
						Edit
					</Link>
					{(canManageAll || Number(row.original.createdby) === Number(employeeid)) && (
						<button type="button" className="btn btn-sm btn-outline-danger"
							disabled={deletingId !== null}
							aria-label={`Delete template ${row.original.name}`}
							onClick={() => void deleteTemplate(row.original)}>
							{deletingId === value ? "Deleting..." : "Delete"}
						</button>
					)}
				</div>
			),
		},
	];

	const handleserverSidefilteringTemplates = async (filters: {
		count: number, page: number, sortby:
		"ASC" | "DESC"
	}) => {
		try {
			const { count, page, sortby } = filters;
			const url = `result/entry/ultrasound/templates/list?page=${page}&count=${count}&employeeid=${employeeid}&sortby=${sortby}`;
			const response = await customFetch(url);
			if (Array.isArray(response)) {
				setTemplateList(response);
				return { result: response, error: false };
			} else {
				toast.error("Unable to load ultrasound templates. The server returned an invalid response.");
				return { result: [], error: true };
			}
		} catch (err) {
			console.error("Error fetching ultrasound templates:", err);
			toast.error("Unable to load ultrasound templates. Try again.");
			return { result: [], error: true };
		}
	}

	if (!employeeid) return null;

	if (isLoading) {
		return (
			<div className="p-3" role="status" aria-busy="true">
				<Loader />
				<span className="visually-hidden">Loading ultrasound templates</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert">
				<span>{error}</span>
				<button type="button" className="btn btn-outline-danger btn-sm" onClick={() => void fetchData()}>
					Retry
				</button>
			</div>
		);
	}

	return (
		<main className="container-fluid px-3 py-3">
			<header className="border-bottom pb-3 mb-3">
				<h1 className="h4 fw-semibold mb-1">Ultrasound templates</h1>
				<p className="text-muted mb-0">Review, update or delete reporting templates. Deleting a template does not change existing patient reports.</p>
			</header>
			<div className="d-flex justify-content-end mb-2">
				<ShowTableCount queryParams={query} setQueryParams={setQuery} />
			</div>
			<PrimeTable
				column={columns}
				data={templateList}
				filtering={false}
				handleSeverSideProcessing={handleserverSidefilteringTemplates}
				serverSideFiltering={true}
			/>
		</main>
	);
}
