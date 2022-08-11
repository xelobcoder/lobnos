import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";

function PendingResults() {
    return (
        <>
            <h1>pending results</h1>
            
        </>
    )
}

export default PendingResults;



PendingResults.getLayout = function (page) {
    return (
        <>
            <Header />
            <div className="wrapper">
                <div className="side">
                    <SidebarFrontPage />
                </div>
                <div className="main">
                    {page}
                </div>
            </div>
        </>
    )
}





PendingResults.getLayout = function (page) {
    return (
        <>
            <Header />
            <div className="wrapper">
                <div className="side">
                    <SidebarFrontPage />
                </div>
                <div className="main">
                    {page}
                </div>
            </div>
        </>
    )
}