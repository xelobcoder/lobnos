import { customFetch,getDataAndUpdateState } from "../Auth/customFetch"
export const handleAssignWare = (data,router) => {
  const { name, stockid } = data;
  router.push(`/inventory/stocks/brands?stockname=${name}&&stockid=${stockid}`);
}


export const getcategorylist = async (setCategorylist) => {
  getDataAndUpdateState(setCategorylist, "stock/category");
}


export const getWareHouseList = async (setWareHouseList) => {
  getDataAndUpdateState(setWareHouseList,"inventory/warehouse");
}
export const getShelves = (target, setShelves) => {
  if (!target || !setShelves && typeof setShelves != 'function') {
    new TypeError('target and setShelve update state required');
  }
  getDataAndUpdateState(setShelves, `inventory/shelve?target=${target}`);
}

export const getWareHouseShelves = async (warehouseid, setShelve) => {
  if (!warehouseid || !setShelve) return false;
  await getDataAndUpdateState(setShelve,`inventory/warehouse/shelves?warehouseId=${warehouseid}`);
}



export const getStocks = async (query,stateHolder) => {
  customFetch(`stock?${query}`)
    .then((data) => { data?.status === "success" && stateHolder(data?.result)})
    .catch((err) => console.log(err));
};

export const Consumptionunitlist = ['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box']
export const Purchaseunitlist = ['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box']
export const defaultStockDetails = {
  name: '', 
  category: '',
  consumptionunit: '',
  purchaseunit: '',
  quantity: '',
  alertlevel: '',
  materialcode: '',
  warehouse: '',
  shelf: '',
}


export const updatePagination = (state, action) => {
  const { count, page } = state;
  switch (action) {
    case "increment":
      return { count, page: page + 1 };
    case "decrement":
      if (page > 1) {
        return { count, page: page - 1 };
      }
      return state;
    default:
      return { count, page: action };
  }
};


export const filterStocks = async (filter, warehouseid, query,setState) => {
  if (filter.length < 3) return;
  console.log(warehouseid)
  let endpoint = `stocks/filter?filter=${filter}&&count=${query?.count}&&page=${query.page}`;
  if (warehouseid) {
    endpoint = `${endpoint}&&warehouseid=${warehouseid}`
  }
  const response = await customFetch(endpoint);
  const { status, statusCode, result } = response;
  if (statusCode == 200 && status == 'success' && Array.isArray(result)) {
    setState(result);
  }
}