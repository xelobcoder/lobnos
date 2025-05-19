import React from "react";
import { useRouter } from "next/router";
import { RiHome2Fill } from "@remixicon/react";


export default function NotFound() {
  const router = useRouter();
  return (
    <div className="m-2 br-7 bg-warning text-white">
      <header className=" d-flex justify-content-center mt-4 ">
        <h1 className="m-2 p-2">PAGE NOT FOUND</h1>
      </header>
      <header className="d-flex justify-content-center mt-4">
        <div>
          <h1 style={{ fontSize: "100px" }}>404</h1>
          <button
            onClick={(ev) => {
              router.push("/");
            }}
            className="btn btn-primary mb-2"
          >
            visit homepage <RiHome2Fill/>
          </button>
        </div>
      </header>
    </div>
  );
}
