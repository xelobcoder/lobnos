import React from 'react';
import TopMessage from '../../components/accessories/TopMessage';
import ADD_NEW_SUPPLIER from '../../components/suppliers/addNewSupplier';
import SUPPLIERS_SEARCH_BAR from '../../components/suppliers/searchBar'
import InventroyHeader from '../../components/inventroyHeader';
import Header from '../../components/header';
import SUPPLIERS_LIST from '../../components/suppliers/supllyList';


export default function SUPPLY() {
  const [viewadd, setviewadd] = React.useState(false);
  const [rawdata, setRawdata] = React.useState([]);
  const [buttonstatus, setButtonstatus] = React.useState("submit");

  const [messageshow, setMessageshow] = React.useState(false);
  const [message, setMessage] = React.useState({
    type: "",
    message: "",
    display: false,
  });

  // fetch data from server
  React.useEffect(() => {
    try {
      const fetchdata = async () => {
        const response = await fetch('http://localhost:5000/api/v1/suppliers');
        const data = await response.json();
        setRawdata(data.result);
      }
      fetchdata();
    }
    catch (error) {
      console.log(error);
    }
  }, [])




  // constroller for deleting a supplier
  const deletehandler = async (id, supplierid) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/suppliers?supplierid=${supplierid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        // remove the deleted item from the list using the supplierid
        const nwdata = rawdata.filter((item) => item.supplierid !== supplierid);
        setRawdata(nwdata);
        setMessageshow(true);
        setMessage({
          type: "success",
          message: "supplier deleted successfully",
          display: true,
        });
      }
    } catch (error) {
      setMessageshow(true);
      setMessage({
        type: "danger",
        message: "error deleting supplier",
        display: true,
      });
    }
  }

  // controller for updating a supplier
  const updatehandler = async (id, supplierid) => {
    // get data from raw data using the supplierid
    const data = rawdata.filter(item => item.supplierid === supplierid);
    // set the data to the update state
    // make the viewadd true
    setviewadd(true);
    setNewSupplier(data[0]);
    setButtonstatus('update');
  }

  // search controller

  const searchhandler = async (ev) => {
    const ans = ev.target.value;
    // filter the rawdata using the ans
    if (ans.length == 0) {
      const fetchdata = async () => {
        const response = await fetch('http://localhost:5000/api/v1/suppliers');
        const data = await response.json();
        setRawdata(data.result);
      }
      fetchdata();
    }
    else {
      const nwdata = rawdata.filter(
        (item) =>
          item.name.toLowerCase().includes(ans.toLowerCase()) ||
          item.commodity.toLowerCase().includes(ans.toLowerCase()) ||
          item.address.toLowerCase().includes(ans.toLowerCase())
      );
      setRawdata(nwdata);
    }
  }

  const messageTimer = () => {
    setTimeout(() => {
      setMessageshow(false);
      setMessage({
        type: '',
        message: '',
        display: false
      })
    }, 3000);
  }

  return (
    <div id='supply-overhead'>
      {messageshow ? <TopMessage message={message.message} messageTimer={messageTimer} display={message.display} type={message.type} /> : null}
      {/* once viewadd which toggles the display of ADD NEW SUPLLIER component is true, then this add section appears */}
      {
        viewadd === true ? (
          <div>
            <ADD_NEW_SUPPLIER newsupplier={newsupplier}
              controllerName={controllerName}
              buttonstatus={buttonstatus}
              controllerAddress={controllerAddress}
              controllerCommodity={controllerCommodity}
              handleSubmit={handleSubmit}
              viewhandler={viewhandler}
              rawdata={rawdata}
            />
          </div>
        ) : null
      }
      <SUPPLIERS_SEARCH_BAR searchhandler={searchhandler} />
      <SUPPLIERS_LIST rawdata={rawdata || []}
        editController={updatehandler}
        deleteController={deletehandler} />
    </div>
  )
}

SUPPLY.getLayout = (page) => {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventroyHeader />
        </div>
        <div className="main">{page}</div>
      </div>
    </>
  );
}