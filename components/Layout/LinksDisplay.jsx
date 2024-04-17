import { useState } from "react"
import Link from "next/link"
import { ArrowDownward } from "@mui/icons-material"
import { usePathname } from "next/navigation"

export default function SubLinksSideBar({ sideLinks, }) {
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  const toggleSubbLinks = () => {
    setShow(!show)
  }
  return (
    <>
      {sideLinks.map((item, index) => {
        return (
          <>
            <li
              key={item.link}
              className={item.link == pathname && !item?.subLinks && "sidebar-active"}
              style={{ gridTemplateColumns: item?.subLinks ? "85% 15%" : "100%" }}>
              {item?.subLinks ? (
                <a className="pointer">
                  {item.icon} {item.title}
                </a>
              ) : (
                <Link href={item.link}>
                  {item.icon}
                  {item.title}
                </Link>
              )}
              <div className={item.subLinks ? "dropdown-sidebar" : "d-none"}>
                <span
                  onClick={(ev) => {
                    toggleSubbLinks()
                  }}>
                  {item.subLinks && <ArrowDownward />}
                </span>
              </div>
            </li>
            {show && item?.subLinks && (
              <ul>
                {item.subLinks.map((item, ind) => {
                  return (
                    <li className={item.link == pathname && "sidebar-active"} key={ind}>
                      <Link href={item.link}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )
      })}
    </>
  )
}
