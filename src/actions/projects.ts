"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== "admin") {
    throw new Error("Unauthorized admin access.");
  }
}

export async function getProjectsAction(page = 1, pageSize = 50) {
  const skip = (page - 1) * pageSize;

  const [total, projects] = await Promise.all([
    prisma.project.count(),
    prisma.project.findMany({
      skip,
      take: pageSize,
      orderBy: { id: "desc" },
    }),
  ]);

  return {
    projects,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

export async function importProjectsAction(formData: FormData) {
  await checkAdmin();

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "Please select an Excel file (.xlsx or .xls)." };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert rows to JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (rawRows.length === 0) {
    return { error: "The uploaded spreadsheet is empty." };
  }

  const importedProjects = [];

  for (const row of rawRows) {
    // Standardize column key lookup case-insensitively
    const getVal = (possibleKeys: string[]) => {
      for (const k of possibleKeys) {
        const foundKey = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
        if (foundKey && row[foundKey] !== undefined) return row[foundKey];
      }
      return null;
    };

    const activityNo = String(getVal(["Activity No", "activity_no", "Activity_No", "ActivityNo"]) || "").trim();
    const activityDesc = String(getVal(["Activity Description", "activity_description", "Description"]) || "").trim();

    if (!activityNo && !activityDesc) continue; // skip empty filler row

    const parseNum = (val: any) => {
      const n = parseFloat(String(val).replace(/,/g, ""));
      return isNaN(n) ? 0 : n;
    };

    const galle = parseNum(getVal(["Galle", "galle"]));
    const ambalangoda = parseNum(getVal(["Ambalangoda", "ambalangoda"]));
    const elipitiya = parseNum(getVal(["Elpitiya", "elipitiya", "elpitiya"]));
    const udugama = parseNum(getVal(["Udugama", "udugama"]));
    const matara = parseNum(getVal(["Matara", "matara"]));
    const akurassa = parseNum(getVal(["Akuressa", "akurassa", "akuressa"]));
    const mulkirigala = parseNum(getVal(["Mulkirigala", "mulatiyana", "mulkirigala"]));
    const deniyaya = parseNum(getVal(["Deniyaya", "deniyaya"]));
    const hambantota = parseNum(getVal(["Hambantota", "hambantota"]));
    const tangalle = parseNum(getVal(["Tangalle", "tangalle"]));
    const walasmulla = parseNum(getVal(["Walasmulla", "walasmulla"]));
    const pde = parseNum(getVal(["PDE", "pde"]));

    const calculatedTotal =
      galle + ambalangoda + elipitiya + udugama + matara + akurassa + mulkirigala + deniyaya + hambantota + tangalle + walasmulla + pde;

    const rowTotal = parseNum(getVal(["Total", "total"])) || calculatedTotal;

    importedProjects.push({
      strategy: String(getVal(["Strategy", "strategy"]) || ""),
      activityNo: activityNo || "-",
      activityDescription: activityDesc || "-",
      location: String(getVal(["Location", "location"]) || ""),
      q1: String(getVal(["Q1", "q1"]) || ""),
      q2: String(getVal(["Q2", "q2"]) || ""),
      q3: String(getVal(["Q3", "q3"]) || ""),
      q4: String(getVal(["Q4", "q4"]) || ""),
      budgetHead: String(getVal(["Budget Head", "budget_head"]) || ""),
      programme: String(getVal(["Programme", "programme"]) || ""),
      project: String(getVal(["Project", "project"]) || ""),
      objectCode: String(getVal(["Object Code", "object_code"]) || ""),
      noOfUnits: parseInt(String(getVal(["No of Units", "no_of_units", "Units"]) || "0"), 10) || null,
      unitCost: parseNum(getVal(["Unit Cost", "unit_cost"])),
      estimatedCostR: parseNum(getVal(["Est. R", "estimated_cost_r"])),
      estimatedCostC: parseNum(getVal(["Est. C", "estimated_cost_c"])),
      estimatedCostT: parseNum(getVal(["Est. T", "estimated_cost_t"])),
      kpi: String(getVal(["KPI", "kpi"]) || ""),
      fundingSource: String(getVal(["Funding Source", "funding_source"]) || ""),
      referencePlan: String(getVal(["Reference Plan", "reference_plan"]) || ""),
      galle,
      ambalangoda,
      elipitiya,
      udugama,
      matara,
      akurassa,
      mulkirigala,
      deniyaya,
      hambantota,
      tangalle,
      walasmulla,
      pde,
      total: rowTotal,
      status: String(getVal(["Status", "status"]) || "Approved"),
    });
  }

  if (importedProjects.length > 0) {
    await prisma.project.createMany({ data: importedProjects });
  }

  revalidatePath("/admin/projects");
  return { success: true, count: importedProjects.length };
}

export async function exportProjectsAction() {
  const projects = await prisma.project.findMany({
    orderBy: { id: "asc" },
  });

  const exportData = projects.map((p, idx) => ({
    "#": idx + 1,
    Strategy: p.strategy || "",
    "Activity No": p.activityNo,
    "Activity Description": p.activityDescription,
    Location: p.location || "",
    Q1: p.q1 || "",
    Q2: p.q2 || "",
    Q3: p.q3 || "",
    Q4: p.q4 || "",
    "Budget Head": p.budgetHead || "",
    Programme: p.programme || "",
    Project: p.project || "",
    "Object Code": p.objectCode || "",
    "Units": p.noOfUnits ?? "",
    "Unit Cost": p.unitCost,
    "Est. R": p.estimatedCostR,
    "Est. C": p.estimatedCostC,
    "Est. T": p.estimatedCostT,
    KPI: p.kpi || "",
    "Funding Source": p.fundingSource || "",
    "Reference Plan": p.referencePlan || "",
    Galle: p.galle,
    Ambalangoda: p.ambalangoda,
    Elpitiya: p.elipitiya,
    Udugama: p.udugama,
    Matara: p.matara,
    Akuressa: p.akurassa,
    Mulkirigala: p.mulkirigala,
    Deniyaya: p.deniyaya,
    Hambantota: p.hambantota,
    Tangalle: p.tangalle,
    Walasmulla: p.walasmulla,
    PDE: p.pde,
    Total: p.total,
    Status: p.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");

  const buffer = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  return buffer;
}
