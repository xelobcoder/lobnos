import { useContext, useState } from "react"
import Link from "next/link"
import { Menu } from "@mui/icons-material"
import { usePathname } from "next/navigation"
import AuthContext from "../Auth/useAuthentification"
export default function AppCustomLayout({ children, sideLinks, defaultscreen = true }) {
  const { auth } = useContext(AuthContext)
  const [fullscreen, setFullscreen] = useState(defaultscreen)
  const { username, role } = auth
  const pathname = usePathname()

  const toggleSidebar = () => {
    setFullscreen(!fullscreen)
  }

  return (
    <div className={fullscreen ? "wrapper" : "minify-wrapper"}>
      <div className={`side`}>
        <div className={`settings-sidebar`}>
          <div className="head">
            <Link href={"/"}>PLS</Link>
          </div>
          <div className="user">
            <Menu
              sx={{fontSize:'40px'}}
              onClick={(ev) => {
                toggleSidebar()
              }}
              className="pointer"
            />{" "}
            {fullscreen && (
              <span className="mx-2 mt-1">
                {username}({role})
              </span>
            )}
          </div>
          <div className="contents">
            <ul>
              {sideLinks.map((item, index) => {
                return (
                  <Link href={item.link} key={index} className={`${fullscreen ? "fullscreen" : "not-fullscreen"}`}>
                    <div
                      className={`icons pointer d-flex justify-content-center ${
                        !fullscreen && item.link === pathname && "bg-primary p-2 br-5 m-2"
                      } ${!fullscreen && pathname !== item.link ? "p-2 br-5 m-2 bg-secondary" : ""}`}>
                      {fullscreen ? (
                        <span title={item.title}>{item.icon}</span>
                      ) : (
                        <span 
                          className={`d-flex justify-content-center expanded-svg
                          ${item.link === pathname ? "icons-no-text text-white" : "icons-no-text text-white"}`}>
                          {item.icon}
                        </span>
                      )}
                    </div>
                    {fullscreen && <div className="text mt-1">{item.title}</div>}
                  </Link>
                )
              })}
            </ul>
          </div>
        </div>
        {/* {sidebar} */}
      </div>
      <div className="main">{children}</div>
    </div>
  )
}
