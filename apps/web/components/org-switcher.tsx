"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, ChevronDown, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface OrgSwitcherProps {
  currentOrgId?: string;
  currentOrgName: string;
}

export function OrgSwitcher({ currentOrgId, currentOrgName }: OrgSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: memberships } = useQuery({
    queryKey: ["memberships"],
    queryFn: () => fetch("/api/team/memberships").then((res) => res.json()),
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = async (targetOrgId: string) => {
    if (targetOrgId === currentOrgId) {
      setIsOpen(false);
      return;
    }

    try {
      setIsSwitching(true);
      const res = await fetch("/api/team/switch-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: targetOrgId }),
      });

      if (!res.ok) {
        throw new Error("Failed to switch organization");
      }

      // Refresh the session client-side so the JWT contains the new orgId
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      await supabase.auth.refreshSession();
      
      // Reload the page completely to reset all state and re-fetch queries with the new org
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Error switching organization.");
      setIsSwitching(false);
    }
  };

  const hasMultiple = memberships && memberships.length > 1;

  return (
    <div className="relative mt-4" ref={menuRef}>
      <button
        onClick={() => {
          if (hasMultiple) {
            setIsOpen(!isOpen);
          } else {
            router.push('/settings/company');
          }
        }}
        disabled={isSwitching}
        className="flex w-full items-center justify-between rounded-[6px] border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/82 hover:bg-white/10 transition focus-ring disabled:opacity-50"
      >
        <span className="truncate">{currentOrgName}</span>
        {isSwitching ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : hasMultiple ? (
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : null}
      </button>

      {isOpen && hasMultiple && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border border-white/10 bg-ink-900 py-1 shadow-lg z-50">
          <div className="px-3 py-1 text-xs font-medium text-white/50 uppercase tracking-wider">
            Switch organization
          </div>
          {memberships.map((m: any) => (
            <button
              key={m.orgId}
              onClick={() => handleSwitch(m.orgId)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition"
            >
              <span className="truncate">{m.org.name}</span>
              {m.orgId === currentOrgId && <Check className="h-4 w-4 text-brass-400" />}
            </button>
          ))}
          <div className="my-1 border-t border-white/10" />
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/settings/company');
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition"
          >
            Manage current org
          </button>
        </div>
      )}
    </div>
  );
}
