"use client"
import { useState } from "react";



export default function Settings() {
	const [key, setKey] = useState("result#settings");
	return (
		<div>
			<h5 className="fw-bold mx-2 bg-secondary-subtle p-3 my-3">
				Application settings
			</h5>
			<div className="mx-2">
			
			</div>
		</div>
	);
}
