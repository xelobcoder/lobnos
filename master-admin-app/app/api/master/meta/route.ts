import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET() {
     try {
          const [sampleTypes, departments, sampleContainers] = await Promise.all([
               db("sampletype").select({ id: "id", name: "name" }).orderBy("name", "asc"),
               db("departments").select({ id: "id", name: "department" }).orderBy("department", "asc"),
               db("samplecontainer").select({ id: "id", name: "name", volume_capacity: "volume_capacity" }).orderBy("name", "asc"),
          ]);

          return NextResponse.json(
               {
                    status: "success",
                    data: {
                         departments,
                         sampleTypes,
                         sampleContainers,
                    },
               },
               { status: 200 }
          );
     } catch (error: any) {
          console.error("Error loading master form metadata:", error);
          return NextResponse.json({ message: "Failed to load master form metadata." }, { status: 500 });
     }
}
