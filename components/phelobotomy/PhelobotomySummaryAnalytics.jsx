import { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";

const defaultValues = { rejected: null, orders: null, completed: null, pending: null }
export default function PhelobotomySummaryAnalytics() {
    const [data, setData] = useState(defaultValues);
    const [isLoading, setIsLoading] = useState(false);


    const fetchSummary = async function () {
        try {
            setIsLoading(true)
            const response = await customFetch(`ascension/phelobotomistAnalyticsSummary`);
            setData(response);
        } catch (err) {
            setData(defaultValues);
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        fetchSummary();
    }, [])


    if (isLoading) return <div className="text-italic">Loading Data ......................</div>

    return (
        <div>
            <section className="grid-4">
                <div className="mb-2 card p-0 alert alert-warning  text-dark card-small">
                    <span className="card-header text-uppercase fw-bold">
                        Pending Sample Cases {"<"}24 hours{">"}</span>
                    <div className="card-body p-0">
                        <h1 className="text-center">{data.pending}</h1>
                    </div>
                </div>
                <div className="mb-2 p-0 card alert alert-success card-small mx-2">
                    <span className="card-header text-uppercase fw-bold">
                        Collected cases {"<"}24 hours{">"}</span>
                    <div className="card-body p-0">
                        <h1 className="text-center">{data.completed}</h1>
                    </div>
                </div>
                <div className="mb-2  p-0  card alert alert-danger  mx-2 card-small">
                    <span className="card-header text-uppercase fw-bold">
                        Rejected sample Cases{"<"}24 hours{">"}</span>
                    <div className="card-body p-0">
                        <h1 className="text-center">{data.rejected}</h1>
                    </div>
                </div>
                <div className="mb-2 card alert alert-info  text-dark  p-0 card-small">
                    <span className="card-header text-uppercase fw-bold">
                        Redrawn  completed{"<"}24 hours{">"}</span>
                    <div className="card-body p-0">
                        <h1 className="text-center">{data.completed}</h1>
                    </div>
                </div>
            </section>
        </div>
    );
}
