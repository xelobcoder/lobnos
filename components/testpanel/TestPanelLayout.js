import React, { useContext } from "react";
import TestContext from "../../components/testpanel/contextTest";
import { TestPanelProvider } from "../../components/testpanel/contextTest";
import { useRouter } from "next/router";

export default function TestPanelLayout({ children }) {
  const router = useRouter();
  return (
    <>
      <div className="container-fluid">
        <div className="testpanel">
          <div>
            <ul>
              <li onClick={(e) => router.push("/testpanel")}>test</li>
              <li onClick={(e) => router.push("/testpanel/categories")}>
                categories
              </li>
              <li onClick={(e) => router.push("/testpanel/addcategory")}>
                Add categories
              </li>
              <li  onClick={(e) => router.push("/testpanel/addtest")}>add test</li>
            </ul>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
