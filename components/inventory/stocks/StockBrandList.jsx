import { useCallback, useEffect, useState } from "react"
import Loader from "../../accessories/Loader";
import RacKCard from '../../../components/accessories/CardRacks';
import { customPost, getDataAndUpdateState } from "../../Auth/customFetch";
import AddNewBrandForm from "./AddNewBrandForm";
import StockBrandListViewComponent from "./StockBrandListViewComponent";
import { ToastContainer, toast } from 'react-toastify';

export default function StockBrandList({ id,stockname}) {
   const [loading, setLoading] = useState(true);
   const [brands,setBrands] = useState([])

   const getBrands= useCallback(async () => {
      getDataAndUpdateState(setBrands, `stock/brands?stockid=${id}`)
      .then(() => setLoading(false))
      .finally(() => setLoading(false));
   },[id])
  
   useEffect(() => {
      if (id) {
         getBrands();
      };
   }, [getBrands,id])
   
   const updateBrand = async (brand) => {
      if (!id) {
         window.history.back();
         return;
      }
      if (brand.length === 0) {
         toast.error('Please fill the field with the brand name',{autoClose: 3000});
         return;
      }
      const pushData = await customPost('stock/brands', 'POST', { brand, stockid: id });
      const { statusCode, message, status } = pushData;
      if (statusCode == 200 && status == 'success') {
         toast.success(message, { autoClose: 500 });
         getBrands();
      }
   }
   

   const onEdit = (brandid) => { console.log(brandid); }
   const onDelete = (brandid) => { console.log(brandid);}
  
   return (
      <>
         <ToastContainer />
         <section className="grid grid-50">
         <div className="list-group">
               {loading ? <Loader /> : <RacKCard
                  header={  <h5 className="text-uppercase">{stockname} Brands</h5>}
                  body={<StockBrandListViewComponent  brands={brands} />} />}
         </div>
            <RacKCard  header={<h5>Add new Brand</h5>} style={{height:'max-content'}}
               body={<AddNewBrandForm updateBrands={updateBrand}/>}
            />
        </section>
      </>
   )
}