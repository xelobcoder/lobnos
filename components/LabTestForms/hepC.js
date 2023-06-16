import UseHepHook from "./useHepHook"
export default function HepatitisC({ clientdata }) {
  return (
    <>
      <UseHepHook clientdata={clientdata} testname='hepatitisc'  description={'hepatitis c test'} />
    </>
  )
}