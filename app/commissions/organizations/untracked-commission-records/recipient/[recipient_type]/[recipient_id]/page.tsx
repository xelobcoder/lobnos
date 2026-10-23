"use client";;
import { use } from "react";
import UntrackedServices from "../../../../UntrackedServices";

export default function RecipientUntrackedServicesPage(
    props: {
        params: Promise<{ recipient_type: string; recipient_id: string }>;
    }
) {
    const params = use(props.params);
    return <UntrackedServices recipientType={params.recipient_type} recipientId={params.recipient_id} />;
}
