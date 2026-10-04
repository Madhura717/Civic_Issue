import { CircleAlert, MapPin } from "lucide-react";
import { useState } from "react";
import { Complaint, statusTone } from "@/lib/civic-data";

export function IssueMap({ issues, compact = false }: { issues: Complaint[]; compact?: boolean }) {
  const [selected, setSelected] = useState<Complaint | null>(issues[0] ?? null);
  return (
    <div className={`map-board ${compact ? "min-h-[260px]" : ""}`} role="application" aria-label="Civic issue map">
      <span className="map-label left-[12%] top-[18%]">North Quarter</span>
      <span className="map-label right-[11%] top-[34%]">East Market</span>
      <span className="map-label left-[32%] bottom-[21%]">Central Square</span>
      <span className="map-label right-[15%] bottom-[15%]">Riverside</span>
      {issues.map((issue, index) => {
        const tone = statusTone(issue.priority);
        return <button key={issue.id} className={`map-marker map-marker--${tone === "amber" ? "amber" : tone === "red" ? "red" : "green"}`} style={{ left: `${18 + ((index * 19) % 67)}%`, top: `${19 + ((index * 27) % 53)}%` }} onClick={() => setSelected(issue)} aria-label={`View ${issue.title}`}><MapPin size={13} /></button>;
      })}
      <div className="map-overlay"><div className="map-overlay-card">{selected ? <><strong>{selected.title}</strong><span>{selected.area} · {selected.status}</span></> : <><strong>No nearby issues</strong><span>Try another area.</span></>}</div><div className="rounded-full border border-white/70 bg-white/90 px-3 py-2 text-[.68rem] font-extrabold text-[#40635e]"><CircleAlert size={12} className="mr-1 inline" /> {issues.length} reports in view</div></div>
    </div>
  );
}
