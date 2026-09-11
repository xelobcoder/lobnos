import Link from "next/link";
import { useApplicationSettings } from "../Auth/useApplicationContext";


const TestActions = ({ id, row, deleteCustomTest }) => {
    const { services } = useApplicationSettings().applicationsettings;
    const { name } = row.original;

    return (
        <div className="pointer">
            <Link href={`/settings/applicationsettings/testpanels/testlist/${id}`} className="btn btn-sm btn-outline-primary me-2 mb-1">
                Manage Test
            </Link>
            <button type="button" className="btn btn-sm btn-outline-danger mb-1" onClick={() => deleteCustomTest(row.original)}>
                Drop Test
            </button>
        </div>
    );
};

export default TestActions;
