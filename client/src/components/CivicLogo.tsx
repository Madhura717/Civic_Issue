import { Check, MapPin } from "lucide-react";
import { Link } from "wouter";

export function CivicLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="CivicSense home">
      <span className={`grid h-9 w-9 place-items-center rounded-[11px] ${inverse ? "bg-white text-[#12665b]" : "bg-[#187a6d] text-white"}`}>
        <span className="relative grid place-items-center">
          <MapPin size={19} strokeWidth={2.4} />
          <Check className="absolute top-[5px]" size={8} strokeWidth={3.2} />
        </span>
      </span>
      <span className={`text-[1.05rem] font-extrabold tracking-[-0.03em] ${inverse ? "text-white" : "text-[#10243b]"}`}>Civic<span className={inverse ? "text-[#a8d8ca]" : "text-[#187a6d]"}>Sense</span></span>
    </Link>
  );
}
