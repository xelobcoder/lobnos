export  async function customFetch (endpoint) {
  let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  return await response.json()
}