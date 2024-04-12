import { useContext, useState } from "react"
import Link from "next/link"
import { Logout, Menu } from "@mui/icons-material"
import { usePathname } from "next/navigation"
import AuthContext from "../Auth/useAuthentification"

export default function AppCustomLayout({ children, sideLinks }) {
  const { auth } = useContext(AuthContext)
  const { username, role, branch } = auth
  console.log(auth)
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  return (
    <div className="m-0 p-0">
      <header className="bg-lims-default text-white  prime-header">
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <Menu
              tabIndex="0"
              onClick={(ev) => {
                setShow(!show)
              }}
              className="border pointer mx-3 my-2 br-5 bg-secondary text-white"
              fontSize="large"
            />
            <div className="pls-header">Prime Laboratory System</div>
          </div>
          <div id="prime-header-branch">
            <span>{branch}</span>
            <span>{username}</span>
            <span>
              <Logout />
            </span>
          </div>
        </div>
      </header>
      <div className={`prime-lab-layout`}>
        <div className="sidebarr m-0 p-0" style={{ left: show ? "0px" : "-250px" }}>
          <ul>
            {sideLinks.map((item, index) => {
              return (
                <li key={item.link} className={item.link == pathname && "sidebar-active"}>
                  <Link href={item.link}>
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <main className={`prime-main ${show ? "prime-with-side" : "prime-full"}`}>{children}</main>
      </div>
    </div>
  )
}
