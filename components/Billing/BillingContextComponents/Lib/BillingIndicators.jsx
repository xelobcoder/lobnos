export default function BillingPageIndicatorsShow() {
    return (
        <section>
            <div className="d-flex">
                <div className="d-flex">
                    <div className="progress bg-danger mt-1" style={{ width: '20px', borderRadius: '0px' }}></div>
                    <div className="mx-1">Outsourcing</div>
                </div>
                <div className="d-flex">
                    <div className="progress bg-primary mt-1" style={{ width: '20px', borderRadius: '0px' }}></div>
                    <div className="mx-1">On site test </div>
                </div>
            </div>
        </section>
    )
}