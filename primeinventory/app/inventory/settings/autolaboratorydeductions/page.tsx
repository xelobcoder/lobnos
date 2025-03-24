import Link from "next/link";
import { limsfetch } from "../../../../Lib/fetcher";
import '../../../../styles/prime-table.css'

interface TestItem {
    prim_key: number;
    name: string;
    category: number;
    price: number;
    created_on: string;
    sample: number;
    description: string | null;
    sample_container: string;
    unit: string;
    qty_required: string;
    shorttext: string;
    iscustom: number;
    id: number;
    sampleid: number | null;
}

export default async function TestListDisplay() {
    const dataset = await limsfetch('testpanel/list/bulk');
    let data: TestItem[] = []
    if (Array.isArray(dataset?.data)) {
        data = dataset?.data;
    }


    return (
        <div className="mb-2 ">
            <h5>Test List</h5>
            <div className="bt-wrapper">
                <table className="bt">
                    <thead >
                        <tr>
                            <th className="fw-bold text-uppercase">Name</th>
                            <th className="fw-bold text-uppercase">Description</th>
                            <th className="fw-bold text-uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.prim_key}>
                                <td>{item.name}</td>
                                <td>{item.description || "N/A"}</td>
                                <td>
                                    <Link href={`/inventory/settings/autolaboratorydeductions/${item.id}`} className="text-capitalize text-sm">
                                        create auto deduction template
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
