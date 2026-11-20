import Link from "next/link";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { useTestPanelBasePath } from './TestPanelWorkspace';


const TestActions = <T extends {name: string},>({ id, row, canManage, canDelete, deleteCustomTest }: {id: string | number; row: {original: T}; canManage: boolean; canDelete: boolean; deleteCustomTest: (test: T) => void}) => {
    const { name } = row.original;
    const basePath = useTestPanelBasePath();

    return (
        <div className="pointer">
            {canManage && <Link href={`${basePath}/testlist/${id}`} className="btn btn-sm btn-outline-primary me-2 mb-1">
                Manage Test
            </Link>}
            {canDelete && (
                <button type="button" className="btn btn-sm btn-outline-danger mb-1" onClick={() => deleteCustomTest(row.original)}>
                    Drop Test
                </button>
            )}
            {!canManage && !canDelete && <span className="text-muted small">View only</span>}
        </div>
    );
};

export default TestActions;
