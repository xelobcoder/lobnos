"use client";
import { useSearchParams } from "next/navigation";
import FieldsTab from "../../../../../../components/settingsComponents/test/tabs/FieldsTab";

// Kept for backward-compatible deep links; the in-place hub at testlist/[id] is the primary entry point now.
export default function CreateSingleFieldPage() {
	const searchParams = useSearchParams();
	const testid = searchParams?.get('testid') ? Number(searchParams.get('testid')) : undefined;
	const testname = searchParams?.get('testname') || '';

	if (!testid) {
		return <div className='bg-danger-subtle pls-label p-3 col-4 br-5 plas-color'>Test Not recognized</div>;
	}

	return <FieldsTab testid={testid} testname={testname} />;
}
