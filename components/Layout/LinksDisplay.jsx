import { useState } from "react"
import Link from "next/link"
import { ExpandLess, Home } from "@mui/icons-material";
import { usePathname } from "next/navigation";

export default function SubLinksSideBar({ sideLinks, expand }) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  const toggleSubbLinks = () => {
    setShow(!show);
  };

  return (
    <>
      <li className="bg-secondary text-white br-5 mx-2 my-2 text-dark text-sm ">
        <Link href={"/"}>
          <span className="icon">
            <Home />{" "}
          </span>
          {expand && <span >Applications</span>}
        </Link>
      </li>
      {sideLinks.map((item, index) => {
        return (
          <>
            <li
              key={index + 1}
              className={`bg-secondary text-white br-5 mx-2 my-2 text-dark text-sm ${
                item.link == pathname && !item?.subLinks ? "bg-success text-white" : ""
              }`}>
              {item?.subLinks ? (
                <a
                  className="pointer"
                  onClick={(ev) => {
                    toggleSubbLinks();
                  }}>
                  <span className="icon text-white">{item.icon} </span>
                  {expand && <span>{item.title}</span>}
                  <div className={item.subLinks ? "dropdown-sidebar" : "d-none"}>
                    <span>
                      {item?.subLinks &&
                        expand &&
                        Array.isArray(item.subLinks) &&
                        (!show ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 -960 960 960">
                            <path d="M480-357q-6 0-11-2t-10-7L261-564q-9-9-9-21t9-21 21.5-9 21.5 9l176 176 176-176q9-9 21-9t21 9 9 21.5-9 21.5L501-366q-5 5-10 7t-11 2z"></path>
                          </svg>
                        ) : (
                          <ExpandLess />
                        ))}
                    </span>
                  </div>
                </a>
              ) : (
                <Link href={item.link}>
                  <span className="text-white icon">{item.icon}</span>
                  {expand && <span>{item.title}</span>}
                </Link>
              )}
            </li>
            {show && item?.subLinks && Array.isArray(item.subLinks) && item?.subLinks.length > 0 && (
              <ul className="sidebarul py-2">
                {item.subLinks.map((item, ind) => {
                  return (
                    <li
                      title={item.title}
                      className={`py-1 text-white text-sm d-flex pointer br-5 mx-2 my-1  ${
                        item.link == pathname ? "bg-success" : " bg-secondary-subtle"
                      }`}
                      key={ind + 1}>
                      <Link href={item.link}>
                        <span className="icon mx-1"> {item.icon}</span>
                        {expand && <span className="mx-1">{item.title}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        );
      })}
    </>
  );
}
