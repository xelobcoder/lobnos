export const handleMobile = (e, setValue, setError) => {
  let value = e.target.value
  let length = value.length
  setValue(e.target.value)
  if (length > 10) {
    setError('Maximum of 10 numbers required')
  } else {
    setError('Minimum of 10 numbers required')
  }
  if (!value.startsWith(0)) {
    setError('Number must start with 0')
  }
}

export const handleAge = (y, m, d, age, error) => {
  if (d != '' && m != '' && y != '') {
    const tm = parseInt(new Date().getMonth())
    const ty = parseInt(new Date().getFullYear())
    const td = parseInt(new Date().getDate())
    let bd = parseInt(d)
    let by = parseInt(y)
    let bm = parseInt(m)

    if (by == ty) {
      if (m == tm) {
        isLeft = 0
        isRight = bd > td
        if (isRight) {
          return { days: bd - td }
        } else {
          return { days: isLeft }
        }
      } else {
        if (bd > td) {
          return {
            months: bm - tm,
            days: bd - td,
          }
        } else {
          return {
            months: bm - tm,
            days: td - bd,
          }
        }
      }
    }
  } else if (by > ty) {
    const age = {}
    age.years = by - ty
    age.months = 12 - bm
    console.log(age)
  } 
  else {
    return ( 'false data entered. please check birth year ')
  }
}
