import React, { useContext, useState } from "react";
import TestContext from "../../components/testpanel/contextTest";
import { TestPanelProvider } from "../../components/testpanel/contextTest";
import Link from "next/link";

import { AdUnits, AddCardSharp, Bloodtype, Category, DepartureBoard, Forward, PriceChange, Update, UpdateOutlined } from "@mui/icons-material";

export default function TestPanelLayout({ children }) {
  const [collapse, setCollapse] = useState(true);

  return (
    <>
      <div className="wrapper">
        <div className="frontpagesidebar">
          <li>
            <Link href="/settings/testpanel">
              <div> <Bloodtype /></div>
              <div>test list</div>
            </Link>
          </li>
          {/* <li>
            <Link href="/settings/testpanel/addtest">
              <div><UpdateOutlined /></div>
              <div> update test</div>
            </Link>
          </li> */}
          <li>
            <Link href={'/settings/testpanel/categories'}>
              <div><DepartureBoard /></div>
              <div>update department info</div>
            </Link>
          </li>
          <li>
            <Link href={'/settings/testpanel/testpricing'}>
              <div><PriceChange /></div>
              <div>Bulk test update</div>
            </Link>
          </li>
          <li>
            <Link href={'/settings/testpanel/sampletypes'}>
              <div><AddCardSharp /></div>
              <div>Add Samples Type</div>
            </Link>
          </li>
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}
