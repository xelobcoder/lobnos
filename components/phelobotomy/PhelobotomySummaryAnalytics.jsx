import { customFetch } from "../Auth/customFetch";

const defaultValues = { rejected: null, orders: null, completed: null, pending: null };

export default async function PhelobotomySummaryAnalytics() {
    let data ={} 

    const fetchSummary = async function () {
        try {
            const response = await customFetch(`ascension/phelobotomistAnalyticsSummary`);
            data = response
        } catch (err) {
            data= defaultValues
        } 
    };

    await fetchSummary()


    return (
        <div className="container-fluid">
            <section className="row">
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card  text-dark card-small">
                        <span className="card-header text-uppercase fw-bold  pls-color">
                            Pending  Cases {"<"} 24 hours {">"}
                        </span>
                        <div className="card-body p-0">
                            <h1 className="text-center">{data.pending}</h1>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card  card-small">
                        <span className="card-header text-uppercase fw-bold  pls-color">
                            Collected cases {"<"} 24 hours {">"}
                        </span>
                        <div className="card-body p-0">
                            <h1 className="text-center">{data.completed}</h1>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card  card-small">
                        <span className="card-header text-uppercase fw-bold  pls-color">
                            Rejected Cases {"<"} 24 hours {">"}
                        </span>
                        <div className="card-body p-0">
                            <h1 className="text-center">{data.rejected}</h1>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card  text-dark card-small">
                        <span className="card-header text-uppercase fw-bold pls-color">
                            Redrawn Completed {"<"} 24 hours {">"}
                        </span>
                        <div className="card-body p-0">
                            <h1 className="text-center">{data.completed}</h1>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
