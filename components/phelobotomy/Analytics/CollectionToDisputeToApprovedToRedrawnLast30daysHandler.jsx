import TestAscensionOverMontOverYear from './TemplatesComponentAnalytics/TestAscensionOverMontOverYear';
import TestAscensionOverLast30DaysCard from './TemplatesComponentAnalytics/AscensionLast30daysFlow';
import AscensionOverSpecifiedYear from './TemplatesComponentAnalytics/AscensionOverSpecifiedYear';

export default function CollectionToDisputeToApprovedToRedrawnHandler() {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 col-sm-6 col-md-4 col-lg-12 mt-3">
                    <TestAscensionOverMontOverYear />
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-12 mt-3">
                    <TestAscensionOverLast30DaysCard />
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-12 mt-3">
                    <AscensionOverSpecifiedYear />
                </div>
            </div>
        </div>
    );
}
