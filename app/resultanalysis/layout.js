import "bootstrap/dist/css/bootstrap.min.css"
import ResultAnalysisSideBar from "../../lib/resultanalaysis/sidebar";
import '../../lib/resultanalaysis/resultanalysis.css'
export const metadata = {
  title: 'Result Analysis',
  description: 'Analysis of results',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="p-3  bg-primary" >
          <h4 className="text-white">VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE
</h4>
        </nav>
        <div style={{ display: "grid", gridTemplateColumns: '15% auto' }}>
          <aside><ResultAnalysisSideBar /></aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
