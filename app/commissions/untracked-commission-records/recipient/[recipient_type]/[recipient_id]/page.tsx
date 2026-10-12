import UntrackedServices from "../../../../UntrackedServices";

export default function RecipientUntrackedServicesPage({ params }: {
    params: { recipient_type: string; recipient_id: string };
}) {
    return <UntrackedServices recipient={params} />;
}
