import UntrackedServices from "../../../../UntrackedServices";


export default async function RecipientUntrackedServicesPage(
    props: {
        params: Promise<{ recipient_type: string; recipient_id: string }>;
    }
) {
    const params = await props.params;
    return <UntrackedServices recipient={params} />;
}
