"use client"
import { useRouter } from "next/navigation";
import TestForm from "../../../../../../components/settingsComponents/test/testForm";

export default function SingleTestEdit({ params }: { params: { id: number } }) {
    const router = useRouter();
    return (
        <TestForm method="PUT" router={router} testid={params.id} customtest={0} />
    )
}