import { NextRequest, NextResponse } from "next/server";
import { db, withTransaction } from "../../../../lib/db";

const TESTS_TABLE = "test_panels";

const toNumber = (value: unknown, fallback = 0): number => {
     const parsed = Number(value);
     return Number.isFinite(parsed) ? parsed : fallback;
};

const toSafeString = (value: unknown): string => {
     return typeof value === "string" ? value : value == null ? "" : String(value);
};

const parseIdList = (rawIds: string | null): number[] => {
     if (!rawIds) return [];
     return rawIds
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((id) => Number.isInteger(id) && id > 0);
};

export async function GET(_request: NextRequest) {
     try {
          const rows = await db({ t: TESTS_TABLE })
               .leftJoin({ d: "testdetails" }, "d.testid", "t.id")
               .select([
                    "t.prim_key",
                    "t.id",
                    "t.name",
                    "t.category",
                    "t.price",
                    "t.created_on",
                    "t.sample",
                    "t.description",
                    "t.sample_container",
                    "t.unit",
                    "t.qty_required",
                    "t.shorttext",
                    "t.iscustom",
                    "d.testcost",
                    "d.hasManual",
                    "d.procedureCode",
                    "d.pre_Tat",
                    "d.tat",
                    "d.post_Tat",
                    "d.tatCount",
                    "d.updatedon",
                    "d.updatedby",
                    "d.isoutsourced",
                    "d.showtrend",
                    "d.testprice",
                    "d.hasGenderVariation",
                    "d.hasChildrenLimit",
                    "d.childrenlimit",
                    "d.useLiterature",
                    "d.hasDrugs",
                    "d.outSourcingList",
                    "d.post_TatEvaluation",
                    "d.pre_TatEvaluation",
                    "d.tatEvaluation",
                    "d.deviceInterfaceMapping",
                    "d.reportitle",
                    "d.method",
                    "d.instrumentation",
               ])
               .orderBy("t.prim_key", "desc");

          return NextResponse.json({ status: "success", data: rows }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to load master tests." }, { status: 500 });
     }
}

export async function POST(request: NextRequest) {
     try {
          const payload = await request.json();

          const result = await withTransaction(async (trx) => {
               const maxIdRow = await trx(TESTS_TABLE).max<{ maxId: number }>({ maxId: "id" }).first();
               const nextId = toNumber(maxIdRow?.maxId, 100000) + 1;

               await trx(TESTS_TABLE).insert({
                    id: nextId,
                    name: toSafeString(payload.name),
                    category: toNumber(payload.category),
                    price: toNumber(payload.testprice ?? payload.price),
                    sample: toNumber(payload.sample),
                    description: payload.description || null,
                    sample_container: toNumber(payload.sample_container),
                    unit: toSafeString(payload.unit),
                    qty_required: toSafeString(payload.qty_required),
                    shorttext: toSafeString(payload.shorttext),
                    iscustom: toNumber(payload.iscustom, 0),
               });

               await trx("testdetails").insert({
                    testid: nextId,
                    testcost: toNumber(payload.testcost),
                    hasManual: toNumber(payload.hasManual),
                    procedureCode: payload.procedureCode || null,
                    pre_Tat: toNumber(payload.pre_Tat),
                    tat: toNumber(payload.tat),
                    post_Tat: toNumber(payload.post_Tat),
                    tatCount: toNumber(payload.tatCount),
                    updatedon: trx.raw("NOW(6)"),
                    updatedby: toNumber(payload.employeeid),
                    isoutsourced: toNumber(payload.isoutsourced),
                    showtrend: toNumber(payload.showtrend),
                    testprice: toNumber(payload.testprice ?? payload.price),
                    hasGenderVariation: toNumber(payload.hasGenderVariation),
                    hasChildrenLimit: toNumber(payload.hasChildrenLimit),
                    childrenlimit: toSafeString(payload.childrenlimit),
                    useLiterature: toNumber(payload.useLiterature),
                    hasDrugs: toNumber(payload.hasDrugs),
                    outSourcingList: payload.outSourcingList || null,
                    post_TatEvaluation: payload.post_TatEvaluation || "min",
                    pre_TatEvaluation: payload.pre_TatEvaluation || "min",
                    tatEvaluation: payload.tatEvaluation || "min",
                    deviceInterfaceMapping: payload.deviceInterfaceMapping || null,
                    reportitle: payload.reportitle || null,
                    method: payload.method || null,
                    instrumentation: payload.instrumentation || "NONE",
               });

               return { id: nextId };
          });

          return NextResponse.json({ status: "success", result }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to create master test." }, { status: 500 });
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const ids = parseIdList(request.nextUrl.searchParams.get("testid"));
          if (ids.length === 0) {
               return NextResponse.json({ message: "testid is required" }, { status: 400 });
          }

          const result = await withTransaction(async (trx) => {
               await trx("testcreationrules").whereIn("testid", ids).del();
               await trx("testdetailcategory").whereIn("testid", ids).del();
               await trx("setupliteraturereview").whereIn("testid", ids).del();
               await trx("testdetails").whereIn("testid", ids).del();
               const affectedRows = await trx(TESTS_TABLE).whereIn("id", ids).del();
               return { affectedRows };
          });

          return NextResponse.json({ status: "success", result }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to delete master tests." }, { status: 500 });
     }
}
