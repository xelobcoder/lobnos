import "bootstrap/dist/css/bootstrap.min.css"
import ResultAnalysisSideBar from "../../components/ResutlUI/ResultAnalysis/ResultAnalysisSidebar";
import '../../lib/resultanalaysis/resultanalysis.css'
export const metadata = {
  title: 'Result Analysis',
  description: 'Analysis of results',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ backgroundColor: 'rgb(11, 111, 241)', padding: '20px' }} >
          <div className="text-white">VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE
          </div>
        </nav>
        <div style={{ display: "grid", gridTemplateColumns: '15% 85%' }}>
          <aside><ResultAnalysisSideBar /></aside>
          <main className="p-2">{children}</main>
        </div>
      </body>
    </html>
  )
}
