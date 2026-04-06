import { NextRequest, NextResponse } from "next/server";
import { db, withTransaction } from "../../../../../../lib/db";

const parseTestId = (rawId: string): number | null => {
     const id = Number(rawId);
     if (!Number.isInteger(id) || id <= 0) return null;
     return id;
};

const toNumber = (value: unknown, fallback = 0): number => {
     const parsed = Number(value);
     return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
     try {
          const testId = parseTestId(params.id);
          if (!testId) {
               return NextResponse.json({ message: "Invalid test id." }, { status: 400 });
          }

          const [rows, categories] = await Promise.all([
               db("testcreationrules")
                    .select([
                         "id",
                         "testid",
                         "name",
                         "field",
                         "value",
                         "hasunits",
                         "units",
                         "plan",
                         "plain",
                         "ordering",
                         "isValueTracked",
                         "textReference",
                         "upperlimit",
                         "lowerlimit",
                         "category",
                         "options",
                         "undercategory",
                         "categoryid",
                         "valueAlert",
                         "alert",
                         "upperLimitFemale",
                         "lowerLimitFemale",
                         "upperLimitMale",
                         "lowerLimitMale",
                         "upperLimitChildren",
                         "lowerLimitChildren",
                         "upperLimitNeonates",
                         "lowerLimitNeonates",
                    ])
                    .where({ testid: testId })
                    .orderBy("ordering", "asc")
                    .orderBy("id", "asc"),

               db("testdetailcategory")
                    .select(["categoryid", "categoryname"])
                    .where({ testid: testId, deleted: 0 })
                    .orderBy("categoryname", "asc")
                    .catch(() => [] as { categoryid: number; categoryname: string }[]),
          ]);

          return NextResponse.json({ status: "success", data: rows, categories }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to load master field rules." }, { status: 500 });
     }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
     try {
          const testId = parseTestId(params.id);
          if (!testId) {
               return NextResponse.json({ message: "Invalid test id." }, { status: 400 });
          }

          const payload = await request.json();
          const rules = Array.isArray(payload?.data) ? payload.data : [];

          await withTransaction(async (trx) => {
               await trx("testcreationrules").where({ testid: testId }).del();

               if (rules.length === 0) {
                    return;
               }

               const records = rules.map((inputRule: any, index: number) => {
                    const rule = inputRule || {};
                    return {
                         testid: testId,
                         name: rule.name || "",
                         field: rule.field || null,
                         value: rule.value || null,
                         hasunits: toNumber(rule.hasunits),
                         units: rule.units || "",
                         plan: rule.plan || "input",
                         plain: rule.plain || null,
                         ordering: Number.isFinite(Number(rule.ordering)) ? Number(rule.ordering) : index,
                         isValueTracked: toNumber(rule.isValueTracked),
                         textReference: rule.textReference || null,
                         upperlimit: rule.upperlimit ?? null,
                         lowerlimit: rule.lowerlimit ?? null,
                         category: rule.category || null,
                         options: Array.isArray(rule.options) ? rule.options.join(",") : rule.options || null,
                         undercategory: toNumber(rule.undercategory),
                         categoryid: rule.categoryid ?? null,
                         valueAlert: rule.valueAlert ?? null,
                         alert: rule.alert ?? null,
                         upperLimitFemale: rule.upperLimitFemale ?? null,
                         lowerLimitFemale: rule.lowerLimitFemale ?? null,
                         upperLimitMale: rule.upperLimitMale ?? null,
                         lowerLimitMale: rule.lowerLimitMale ?? null,
                         upperLimitChildren: rule.upperLimitChildren ?? null,
                         lowerLimitChildren: rule.lowerLimitChildren ?? null,
                         upperLimitNeonates: rule.upperLimitNeonates ?? null,
                         lowerLimitNeonates: rule.lowerLimitNeonates ?? null,
                    };
               });

               await trx("testcreationrules").insert(records);
          });

          return NextResponse.json({ status: "success", message: "Field rules updated." }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Failed to update field rules." }, { status: 500 });
     }
}
