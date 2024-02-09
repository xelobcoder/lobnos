import CustomFormSwitch from "./CustomFormSwitch"

export default function ApplicationResultSettings() {
  const update = () => {}
  return (
    <div className="grid-30-30-30 mx-2">
      <CustomFormSwitch
        text="literature review text added in test setup would be included in the result printout"
        title="Literature Review"
        value={true}
        update={update}
      />
        <CustomFormSwitch
           text="Include letter headings in the result print before dispatching result" title="Letter Heading" value={true} update={update} />
    </div>
  )
}
