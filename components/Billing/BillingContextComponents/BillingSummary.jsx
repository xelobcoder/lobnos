import { useContext } from "react";
import CardRack from "../../accessories/CardRacks";
import { BillingContext } from "./BillingContext";
import { currencyFormatter } from "../../Auth/customFetch";

export default function BillingPageSummary() {
  const { billingdata } = useContext(BillingContext);


  return (
    <div className="text-sm mx-2">
      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center">{currencyFormatter.format(billingdata?.testcost)} </h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.0049 8V5H4.00488V8H20.0049ZM20.0049 10H4.00488V19H20.0049V10ZM3.00488 3H21.0049C21.5572 3 22.0049 3.44772 22.0049 4V20C22.0049 20.5523 21.5572 21 21.0049 21H3.00488C2.4526 21 2.00488 20.5523 2.00488 20V4C2.00488 3.44772 2.4526 3 3.00488 3ZM11.0049 14H17.0049V16H6.50488L11.0049 11.5V14Z"></path>
            </svg>
            Total Test Cost
          </h6>
        }
      />

      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center">{currencyFormatter.format(billingdata?.amountIncurredDueTax)} </h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M9 3V1H7V3H3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H17V1H15V3H9ZM4 10H20V19H4V10ZM4 5H7V6H9V5H15V6H17V5H20V8H4V5ZM9.87862 10.9644L12 13.0858L14.1212 10.9644L15.5355 12.3785L13.4142 14.5001L15.5354 16.6212L14.1213 18.0354L12 15.9143L9.87855 18.0354L8.46442 16.6211L10.5857 14.5001L8.46436 12.3785L9.87862 10.9644Z"></path>
            </svg>
            Total Taxes
          </h6>
        }
      />
      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center">{currencyFormatter.format(billingdata.totalCostOfServices)} </h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 3H5C4.44772 3 4 3.44772 4 4V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V4C20 3.44772 19.5523 3 19 3ZM12 18H7V16H12V18ZM12 14H7V12H12V14ZM12 10H7V8H12V10ZM17 16H14V14H17V16ZM17 12H14V10H17V12ZM17 8H14V6H17V8ZM12 6H7V4H12V6ZM19 19H5V5H19V19Z"></path>
            </svg>
            Total Service Amount
          </h6>
        }
      />
      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center">{currencyFormatter.format(billingdata?.cost)} </h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.0049 8V5H4.00488V8H20.0049ZM20.0049 10H4.00488V19H20.0049V10ZM3.00488 3H21.0049C21.5572 3 22.0049 3.44772 22.0049 4V20C22.0049 20.5523 21.5572 21 21.0049 21H3.00488C2.4526 21 2.00488 20.5523 2.00488 20V4C2.00488 3.44772 2.4526 3 3.00488 3ZM11.0049 14H17.0049V16H6.50488L11.0049 11.5V14Z"></path>
            </svg>
            Total Cost
          </h6>
        }
      />

      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center">{currencyFormatter.format(billingdata?.discount)} </h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M3.00488 3.00275H21.0049C21.5572 3.00275 22.0049 3.45046 22.0049 4.00275V20.0027C22.0049 20.555 21.5572 21.0027 21.0049 21.0027H3.00488C2.4526 21.0027 2.00488 20.555 2.00488 20.0027V4.00275C2.00488 3.45046 2.4526 3.00275 3.00488 3.00275ZM13.0049 13.0027V12.0027H16.0049V10.0027H13.4191L15.5404 7.88143L14.1262 6.46721L12.0049 8.58853L9.88356 6.46721L8.46935 7.88143L10.5907 10.0027H8.00488V12.0027H11.0049V13.0027H8.00488V15.0027H11.0049V17.0027H13.0049V15.0027H16.0049V13.0027H13.0049Z"></path>
            </svg>
            Discount
          </h6>
        }
      />

      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center">{currencyFormatter.format(billingdata?.payable)}</h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M9 3V1H7V3H3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H17V1H15V3H9ZM4 10H20V19H4V10ZM4 5H7V6H9V5H15V6H17V5H20V8H4V5ZM9.87862 10.9644L12 13.0858L14.1212 10.9644L15.5355 12.3785L13.4142 14.5001L15.5354 16.6212L14.1213 18.0354L12 15.9143L9.87855 18.0354L8.46442 16.6211L10.5857 14.5001L8.46436 12.3785L9.87862 10.9644Z"></path>
            </svg>
            Amt. Payable
          </h6>
        }
      />

      <CardRack
        className="shadow"
        body={<h3 className="d-flex justify-content-center text-danger">{currencyFormatter.format(billingdata?.outstanding)} </h3>}
        header={
          <h6 className="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.0049 8V5H4.00488V8H20.0049ZM20.0049 10H4.00488V19H20.0049V10ZM3.00488 3H21.0049C21.5572 3 22.0049 3.44772 22.0049 4V20C22.0049 20.5523 21.5572 21 21.0049 21H3.00488C2.4526 21 2.00488 20.5523 2.00488 20V4C2.00488 3.44772 2.4526 3 3.00488 3ZM11.0049 14H17.0049V16H6.50488L11.0049 11.5V14Z"></path>
            </svg>
            Outstanding
          </h6>
        }
      />

   
    </div>
  );
}
