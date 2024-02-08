export const onChangeUnit = (e, index, setData) => {
   setData(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], unit: e.target.value }, ...prevState.slice(index + 1)]
   })
}
export const onChangeLower = (e, index) => {
   setData(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], lower: e.target.value }, ...prevState.slice(index + 1)]
   }
   )
}
export const onChangeUpper = (e, index) => {
   setData(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], upper: e.target.value }, ...prevState.slice(index + 1)]
   }
   )
}