import React from "react";
import Barcode from "react-barcode";

function MyComponent() {
  const barcodeData = ['7987873020566', '1602057873799', '1679878730205']; // the data you want to encode in the barcode

  return (
    <div>
      <h1>My Barcode</h1>
      {
        barcodeData.map((item, index) => {
          return <div key={index} className='mt-1 p-1'>
            <Barcode height={20} width={1} value={item} displayValue={false} background={'whitesmoke'} />
          </div>
        })
      }
    </div>
  );
}

export default MyComponent;
