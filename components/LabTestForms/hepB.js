import UseHepHook from "./useHepHook";

export default function HepatitisB({ clientdata }) {
  return (
    <>
      <UseHepHook clientdata={clientdata} testname='hepatitisb' description={'hepatitis b test'} />
    </>
  )
}