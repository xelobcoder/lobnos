import { useContext, useState } from "react"
import Link from "next/link"
import { Menu } from "@mui/icons-material"
import AuthContext from "../Auth/useAuthentification"
import { Tooltip } from "@mui/material"
export default function AppCustomLayout({ children, sideLinks, defaultscreen = true }) {
  const { auth } = useContext(AuthContext)
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState(defaultscreen)
  const { username, role } = auth

  const toggleSidebar = () => {
    setFullscreen(!fullscreen)
  }

  return (
    <div className={fullscreen ? "wrapper" : "minify-wrapper"}>
      <div className="side">
        <div className="settings-sidebar">
          <div className="head">
            <Link href={"/"}>PLS</Link>
          </div>
          <div className="user">
            <Menu
              onClick={(ev) => {
                toggleSidebar()
              }}
              className="pointer link-offset-1-hover"
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
                  <Link
                    href={item.link}
                    key={index}
                    onClick={(ev) => {
                      setActive(index)
                    }}
                    className={`${fullscreen ? "icons-with-text" : ""}`}>
                    <div className={`icons pointer d-flex justify-content-center ${fullscreen ? " " : "bg-secondary m-2 br-5 p-1"}`}>
                      {fullscreen ? (
                        <span title={item.title}>{item.icon}</span>
                      ) : (
                        <Tooltip title={item.title} className={fullscreen ? "text-white" : "icons-no-text"}>
                          {item.icon}
                        </Tooltip>
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
