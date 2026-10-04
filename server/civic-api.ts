import { Router } from "express";
import { addComment, createComplaint, createSafetyReport, dashboard, escalateComplaint, getCategories, getComplaint, getDepartments, getNotifications, listComplaints, listSafetyReports, updateComplaint } from "./civicStore";
import { persistComment, persistComplaint, persistEscalation, persistSafetyReport } from "./civicDb";

export const civicApi = Router();
const cleanString = (value: unknown, max = 4000) => typeof value === "string" ? value.trim().slice(0, max) : "";

civicApi.post("/auth/register", (req, res) => { const email = cleanString(req.body?.email, 320); if (!email || !email.includes("@")) { res.status(400).json({ error: "Enter a valid email address." }); return; } res.status(201).json({ user: { email, role: "citizen", authProvider: "Manus OAuth" }, message: "Continue with Manus OAuth to complete account access." }); });
civicApi.post("/auth/login", (_req, res) => res.json({ message: "Use the configured Manus OAuth login to create an application session." }));
civicApi.post("/auth/logout", (_req, res) => res.json({ ok: true }));

civicApi.get("/categories", (_req, res) => res.json({ categories: getCategories() }));
civicApi.get("/departments", (_req, res) => res.json({ departments: getDepartments() }));
civicApi.get("/notifications", (_req, res) => res.json({ notifications: getNotifications() }));

civicApi.get("/complaints", (req, res) => {
  const query = cleanString(req.query.q, 160).toLowerCase();
  const status = cleanString(req.query.status, 60);
  const category = cleanString(req.query.category, 120);
  let rows = listComplaints();
  if (query) rows = rows.filter(item => `${item.id} ${item.title} ${item.location}`.toLowerCase().includes(query));
  if (status) rows = rows.filter(item => item.status === status);
  if (category) rows = rows.filter(item => item.category === category);
  res.json({ complaints: rows });
});

civicApi.post("/complaints", async (req, res) => {
  const title = cleanString(req.body?.title, 140); const description = cleanString(req.body?.description, 4000);
  if (!title || !description) { res.status(400).json({ error: "Add an issue title and description before submitting." }); return; }
  const complaint = createComplaint(req.body); await persistComplaint(complaint, complaint.history.at(-1));
  res.status(201).json({ complaint });
});
civicApi.post("/complaints/:id/comments", async (req, res) => { const comment = cleanString(req.body?.comment, 1000); if (!comment) { res.status(400).json({ error: "Write a comment before sending." }); return; } const complaint = addComment(req.params.id, comment); if (!complaint) { res.status(404).json({ error: "Complaint not found." }); return; } await persistComment(complaint, complaint.comments.at(-1)!); res.status(201).json({ complaint }); });
civicApi.post("/complaints/:id/assign", async (req, res) => { const complaint = updateComplaint(req.params.id, { assignedOfficer: cleanString(req.body?.assignedOfficer, 120) || "A. Mehta", action: "Complaint assigned" }); if (!complaint) { res.status(404).json({ error: "Complaint not found." }); return; } await persistComplaint(complaint, complaint.history.at(-1)); res.json({ complaint }); });
civicApi.post("/complaints/:id/resolve", async (req, res) => { const complaint = updateComplaint(req.params.id, { status: "Resolved", action: "Resolution proof uploaded and complaint marked resolved", note: cleanString(req.body?.note, 500) }); if (!complaint) { res.status(404).json({ error: "Complaint not found." }); return; } await persistComplaint(complaint, complaint.history.at(-1)); res.json({ complaint }); });
civicApi.post("/complaints/:id/escalate", async (req, res) => { const complaint = escalateComplaint(req.params.id, cleanString(req.body?.reason, 500) || undefined); if (!complaint) { res.status(404).json({ error: "Complaint not found." }); return; } await persistComplaint(complaint, complaint.history.at(-1)); await persistEscalation(complaint, complaint.escalations.at(-1)!); res.status(201).json({ complaint }); });
civicApi.get("/complaints/:id", (req, res) => { const complaint = getComplaint(req.params.id); if (!complaint) { res.status(404).json({ error: "Complaint not found." }); return; } res.json({ complaint }); });
civicApi.patch("/complaints/:id", async (req, res) => { const complaint = updateComplaint(req.params.id, req.body || {}); if (!complaint) { res.status(404).json({ error: "Complaint not found." }); return; } await persistComplaint(complaint, complaint.history.at(-1)); res.json({ complaint }); });

civicApi.post("/safety-reports", async (req, res) => { const location = cleanString(req.body?.location, 180); const description = cleanString(req.body?.description, 2000); if (!location || !description) { res.status(400).json({ error: "Add a general location and description for the safety review." }); return; } const report = createSafetyReport(req.body); await persistSafetyReport(report); res.status(201).json({ report }); });
civicApi.get("/safety-reports", (_req, res) => res.json({ reports: listSafetyReports() }));
civicApi.get("/analytics/dashboard", (_req, res) => res.json(dashboard()));
