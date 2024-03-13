import { useRouter } from "next/navigation"

export default function MiniCard({ colorIndex, text, number, link }) {
  const colorview = {
    0: "bg-primary text-white",
    1: "bg-warning text-white",
    2: "bg-success text-white",
    3: "bg-infotext-white",
    4: "bg-secondary text-white",
    5: "bg-danger text-white",
    6: "bg-primary text-white",
    7: "bg-success text-white",
    8: "bg-primary text-white",
    9: "bg-secondary text-white",
  }

  const router = useRouter()
  return (
    <div
      className={`mx-2 border border-secondary  text-capitalize`}
      onClick={() => {
        if (number == 0) return
        router.push(link)
      }}>
      <div className={`${colorview[colorIndex]}  border-bottom border-secondary p-2`}>
        <h6>{text}</h6>
      </div>
      <div className="p-3 bg-white">
        <h6>{number == 1 ? `${number} case pending ` : `${number} cases pending`}</h6>
      </div>
    </div>
  )
}
