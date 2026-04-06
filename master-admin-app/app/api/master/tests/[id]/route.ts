import { NextRequest, NextResponse } from "next/server";
import { withTransaction } from "../../../../../lib/db";

const TESTS_TABLE = "test_panels";

const toNumber = (value: unknown, fallback = 0): number => {
     const parsed = Number(value);
     return Number.isFinite(parsed) ? parsed : fallback;
};

const toSafeString = (value: unknown): string => {
     return typeof value === "string" ? value : value == null ? "" : String(value);
};

const parseTestId = (rawId: string): number | null => {
     const id = Number(rawId);
     if (!Number.isInteger(id) || id <= 0) return null;
     return id;
};

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
     try {
          const testId = parseTestId(params.id);
          if (!testId) {
               return NextResponse.json({ message: "Invalid test id." }, { status: 400 });
          }

          const payload = await request.json();

          const result = await withTransaction(async (trx) => {
               await trx(TESTS_TABLE)
                    .where({ id: testId })
                    .update({
                         name: toSafeString(payload.name),
                         category: toNumber(payload.category),
                         price: toNumber(payload.testprice ?? payload.price),
                         sample: toNumber(payload.sample),
                         description: payload.description || null,
                         sample_container: toNumber(payload.sample_container),
                         unit: toSafeString(payload.unit),
                         qty_required: toSafeString(payload.qty_required),
                         shorttext: toSafeString(payload.shorttext),
                    });

               const detailPayload = {
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
               };

               const updatedDetail = await trx("testdetails").where({ testid: testId }).update(detailPayload);

               if (updatedDetail === 0) {
                    await trx("testdetails").insert({
                         testid: testId,
                         ...detailPayload,
                    });
               }

               return { testId };
          });

          return NextResponse.json({ status: "success", result }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to update master test." }, { status: 500 });
     }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
     try {
          const testId = parseTestId(params.id);
          if (!testId) {
               return NextResponse.json({ message: "Invalid test id." }, { status: 400 });
          }

          const result = await withTransaction(async (trx) => {
               await trx("testcreationrules").where({ testid: testId }).del();
               await trx("testdetailcategory").where({ testid: testId }).del();
               await trx("setupliteraturereview").where({ testid: testId }).del();
               await trx("testdetails").where({ testid: testId }).del();
               const affectedRows = await trx(TESTS_TABLE).where({ id: testId }).del();
               return { affectedRows };
          });

          return NextResponse.json({ status: "success", result }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to delete master test." }, { status: 500 });
     }
}
