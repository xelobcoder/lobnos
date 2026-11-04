import Link from "next/link";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { usePathname } from "next/navigation";
import { testPanelBasePath } from "../../lib/testPanelNavigation";


const TestActions = <T extends {name: string},>({ id, row, deleteCustomTest }: {id: string | number; row: {original: T}; deleteCustomTest: (test: T) => void}) => {
    const { services } = useApplicationSettings().applicationsettings;
    const { name } = row.original;
    const basePath = testPanelBasePath(usePathname());

    return (
        <div className="pointer">
            <Link href={`${basePath}/testlist/${id}`} className="btn btn-sm btn-outline-primary me-2 mb-1">
                Manage Test
            </Link>
            <button type="button" className="btn btn-sm btn-outline-danger mb-1" onClick={() => deleteCustomTest(row.original)}>
                Drop Test
            </button>
        </div>
    );
};

export default TestActions;
