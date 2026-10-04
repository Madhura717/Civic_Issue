import { Bell, Menu, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { CivicLogo } from "./CivicLogo";

const links = [
  ["Report Issue", "/report"],
  ["Track Complaint", "/track"],
  ["Nearby Issues", "/nearby"],
  ["Safety", "/safety"],
  ["Awareness", "/awareness"],
  ["About", "/about"],
] as const;

export function PublicShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen">
      <header className="public-nav">
        <div className="container public-nav__inner">
          <CivicLogo />
          <nav className="nav-links" aria-label="Main navigation">
            {links.map(([label, href]) => <Link key={href} href={href} aria-current={location === href ? "page" : undefined}>{label}</Link>)}
          </nav>
          <div className="nav-auth">
            <button className="subtle-button hidden text-sm md:block" onClick={() => startLogin()}><span className="inline-flex items-center gap-2"><ShieldCheck size={15} /> Login</span></button>
            <Link className="primary-button !px-4 !py-2.5 text-sm" href="/report">Report an Issue</Link>
            <button className="mobile-menu soft-button !p-2.5" aria-label="Open navigation"><Menu size={17} /></button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-[#dce3e5] bg-white py-8">
        <div className="container flex flex-col justify-between gap-4 text-sm text-[#71808d] md:flex-row md:items-center">
          <CivicLogo />
          <span>Public problems, visible progress, accountable action.</span>
          <span className="inline-flex items-center gap-2"><Bell size={14} /> In-app updates enabled</span>
        </div>
      </footer>
    </div>
  );
}

export function OpsShell({ children, role = "Citizen workspace" }: { children: React.ReactNode; role?: string }) {
  const [location] = useLocation();
  const nav = role === "Authority officer"
    ? [["Overview", "/authority"], ["Complaint queue", "/authority"], ["Nearby issues", "/nearby"]]
    : role === "Higher authority"
      ? [["Oversight", "/oversight"], ["Escalations", "/oversight"], ["Performance", "/oversight"]]
      : role === "System admin"
        ? [["Control center", "/admin"], ["Users & roles", "/admin"], ["Rules", "/admin"]]
        : [["My dashboard", "/dashboard"], ["My complaints", "/track"], ["Nearby issues", "/nearby"], ["Safety", "/safety"]];
  return (
    <div className="shell-page">
      <header className="shell-header">
        <CivicLogo inverse />
        <div className="flex items-center gap-4 text-sm"><span className="hidden text-white/60 md:inline">{role}</span><span className="h-7 w-7 rounded-full bg-[#a8d8ca] text-center text-xs font-extrabold leading-7 text-[#12665b]">AS</span></div>
      </header>
      <div className="shell-layout">
        <aside className="shell-sidebar">
          <div className="sidebar-label">WORKSPACE</div>
          {nav.map(([label, href]) => <Link key={label} href={href} className="sidebar-link" aria-current={location === href ? "page" : undefined}>{label}</Link>)}
          <div className="sidebar-label mt-8">PUBLIC VIEW</div>
          <Link href="/" className="sidebar-link">CivicSense home</Link>
          <Link href="/report" className="sidebar-link">Report an issue</Link>
          <div className="mt-10 rounded-xl bg-[#edf6f3] p-4 text-xs text-[#12665b]"><strong className="block mb-2">Need urgent help?</strong><span className="leading-5 text-[#527a73]">Use the Safety section for configured emergency resources and privacy-aware reports.</span></div>
        </aside>
        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
}
