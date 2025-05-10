import Link from "next/link";
import { generateRandomTextAndNumbers } from "../Auth/customFetch";
import { useApplicationSettings } from "../Auth/useApplicationContext";


const TestActions = ({ id, row, deleteCustomTest }) => {
    const { services } = useApplicationSettings().applicationsettings;
    const { name } = row.original;
    const randomText = generateRandomTextAndNumbers(70);

    return (
        <div className="pointer">
            <Link href={`/settings/applicationsettings/testpanels/testlist/${id}`} className="border-bottom border-primary text-primary">
                Edit test
            </Link>
            <Link href={`/settings/applicationsettings/testpanels/testlist/${id}/literature?litid=${id}&&testname=${name}`} className="mx-2 border-bottom border-primary text-primary">
                Add Literature
            </Link>
            <Link href={`/settings/applicationsettings/testpanels/testlist/procedure/${id}`} className="border-bottom border-primary text-primary mx-2">
                Add Manual
            </Link>
            <Link href={`/operations/laboratory/qualitycontrol/test/${id}`} className="mx-2 border-bottom border-primary text-primary">
                quality control
            </Link>
            {/* {services.isConnectedInventory == 1 &&
                <Link href={`/inventory/autoLaboratorydeductions?testid=${randomText}${row.original.id}`} className="border-bottom mx-2 border-primary text-primary">
                    Inventory Template
                </Link>} */}
            <span className='border-danger border-bottom text-danger' onClick={() => deleteCustomTest(row.original)}>
                Drop Test
            </span>
            <Link href={`/settings/applicationsettings/testpanels/testlist/createfields?testid=${id}&&testname=${name}`} className="mx-2 border-bottom border-primary text-primary">
                Update Fields
            </Link>
            <Link href={`/settings/applicationsettings/testpanels/testlist/createcustomtest?testid=${id}&&testname=${name}`} className="border-bottom border-primary text-primary">
                Update Test
            </Link>
        </div>
    );
};

export default TestActions;
