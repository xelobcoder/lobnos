export default function Loader({w,h}) {
   return <div style={{ width: w || "100px", height: h || "100px" }} className="loader"></div>
}