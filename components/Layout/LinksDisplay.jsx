
import Link from "next/link";
import { ArrowForwardIos, MenuOpen } from "@mui/icons-material";

export default function SubLinksSideBar({ sideLinks, target, handleDropElements }) {
  return (
    <>
      {sideLinks.map((item, index) => {
        const { subLinks } = item;
        const hasSideLinks = subLinks && Array.isArray(subLinks) && subLinks.length > 0;

        return (
          <>
            <li className={`grouper`} key={item.title}>
              {
                hasSideLinks ?
                  <div 
                    onClick={(ev) => { handleDropElements(index) }} className={`link-group text-capitalize  ${target == index ? 'br-5 a-active  m-2 ' : ""}`}>
                    <span className="rxn-icon">{item.icon}</span>
                    <span className="text-sidebar">{item.title}</span>
                    {hasSideLinks && <span className="drop-downicon"><ArrowForwardIos /> </span>}
                  </div>
                  :
                  <Link href={item.link}
                    onClick={(ev) => { handleDropElements(index) }} className={`link-group text-capitalize  ${target == index ? 'br-5 a-active  m-2 ' : ""}`}>
                    <span className="rxn-icon">{item.icon}</span>
                    <span className="text-sidebar">{item.title}</span>
                  </Link>
              }
              {hasSideLinks && target == index && <div className="futher-refer-mother">
                {
                  item.subLinks.map((_single, i) => {
                    return (
                      <div key={_single.title} className="futher-refer-child ">
                        <Link href={_single.link}>
                          <span><MenuOpen /></span>
                          <span className="text-sidebar">{_single.title}</span>
                          {/* <span>60 </span> */}
                        </Link>
                      </div>
                    )
                  })
                }
              </div>
              }
            </li>

          </>
        );
      })}
    </>
  );
}
