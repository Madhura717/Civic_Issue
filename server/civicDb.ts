import { eq } from "drizzle-orm";
import { complaintComments, complaintStatusHistory, complaints, departments, escalations, issueCategories, safetyReports } from "../drizzle/schema";
import { getDb } from "./db";
import type { ComplaintRecord } from "./civicStore";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "other";

async function idsFor(record: ComplaintRecord) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(departments).values({ name: record.department, code: slugify(record.department).slice(0, 48) }).onDuplicateKeyUpdate({ set: { name: record.department } });
  const department = await db.select({ id: departments.id }).from(departments).where(eq(departments.name, record.department)).limit(1);
  const departmentId = department[0]?.id;
  if (!departmentId) return null;
  await db.insert(issueCategories).values({ slug: slugify(record.category), name: record.category, defaultDepartmentId: departmentId }).onDuplicateKeyUpdate({ set: { name: record.category, defaultDepartmentId: departmentId } });
  const category = await db.select({ id: issueCategories.id }).from(issueCategories).where(eq(issueCategories.slug, slugify(record.category))).limit(1);
  const categoryId = category[0]?.id;
  return categoryId ? { db, departmentId, categoryId } : null;
}

export async function persistComplaint(record: ComplaintRecord, latestEvent?: ComplaintRecord["history"][number]) {
  try {
    const ids = await idsFor(record);
    if (!ids) return false;
    const existing = await ids.db.select({ id: complaints.id }).from(complaints).where(eq(complaints.publicId, record.id)).limit(1);
    const values = { publicId: record.id, categoryId: ids.categoryId, departmentId: ids.departmentId, title: record.title, description: record.description, priority: record.priority, status: record.status, latitude: String(record.lat), longitude: String(record.lng), address: record.address, area: record.area, isDangerous: record.dangerous ? 1 : 0, isAtRisk: record.atRisk ? 1 : 0, slaDeadline: new Date(record.deadline), createdAt: new Date(record.submittedAt), updatedAt: new Date() } as const;
    if (existing[0]) await ids.db.update(complaints).set(values).where(eq(complaints.id, existing[0].id));
    else await ids.db.insert(complaints).values(values);
    const row = existing[0] || (await ids.db.select({ id: complaints.id }).from(complaints).where(eq(complaints.publicId, record.id)).limit(1))[0];
    if (row && latestEvent) await ids.db.insert(complaintStatusHistory).values({ complaintId: row.id, status: latestEvent.status, departmentId: ids.departmentId, action: latestEvent.action, note: latestEvent.note, createdAt: new Date(latestEvent.timestamp) });
    return true;
  } catch (error) {
    console.warn("[CivicSense] Database persistence skipped:", error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function persistComment(record: ComplaintRecord, comment: ComplaintRecord["comments"][number]) {
  try {
    const ids = await idsFor(record); if (!ids) return false;
    const row = (await ids.db.select({ id: complaints.id }).from(complaints).where(eq(complaints.publicId, record.id)).limit(1))[0]; if (!row) return false;
    await ids.db.insert(complaintComments).values({ complaintId: row.id, body: comment.body, createdAt: new Date(comment.createdAt) }); return true;
  } catch (error) { console.warn("[CivicSense] Comment persistence skipped:", error instanceof Error ? error.message : String(error)); return false; }
}

export async function persistEscalation(record: ComplaintRecord, escalation: ComplaintRecord["escalations"][number]) {
  try {
    const ids = await idsFor(record); if (!ids) return false;
    const row = (await ids.db.select({ id: complaints.id }).from(complaints).where(eq(complaints.publicId, record.id)).limit(1))[0]; if (!row) return false;
    await ids.db.insert(escalations).values({ complaintId: row.id, fromAuthority: escalation.from, toAuthority: escalation.to, reason: escalation.reason, status: "Open", createdAt: new Date(escalation.createdAt) }); return true;
  } catch (error) { console.warn("[CivicSense] Escalation persistence skipped:", error instanceof Error ? error.message : String(error)); return false; }
}

export async function persistSafetyReport(report: { type: string; location: string; description: string; anonymous: boolean; createdAt: string }) {
  try {
    const db = await getDb(); if (!db) return false;
    await db.insert(safetyReports).values({ type: report.type, location: report.location, description: report.description, isAnonymous: report.anonymous ? 1 : 0, visibility: "private", status: "Received", createdAt: new Date(report.createdAt), updatedAt: new Date() }); return true;
  } catch (error) { console.warn("[CivicSense] Safety report persistence skipped:", error instanceof Error ? error.message : String(error)); return false; }
}
