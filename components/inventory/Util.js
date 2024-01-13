import { customFetch,getDataAndUpdateState } from "../Auth/customFetch"
export const handleAssignWare = (data, router) => {
  return;
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



export const getStocks = async (w,stateHolder) => {
  const warehouseid = w || 'all';
  customFetch(`stock?warehouseid=${warehouseid}`)
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