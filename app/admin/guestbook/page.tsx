import { getSupabaseAdmin } from "@/lib/supabase/server";
import { approvedGuestbookFallback } from "@/lib/data";
import { GuestbookModerator } from "@/components/admin/guestbook-moderator";
import type { Metadata } from "next";

export const metadata: Metadata = { 
  title: "Admin Guestbook Moderator", 
  description: "Approve, reject, or batch-delete public guestbook reviews." 
};

export default async function AdminGuestbookPage() { 
  const supabase = getSupabaseAdmin(); 
  const { data } = supabase 
    ? await supabase.from("guestbook").select("*").order("created_at", { ascending: false }) 
    : { data: null }; 

  const messages = data && data.length ? data : approvedGuestbookFallback;

  return (
    <div className="relative z-10">
      <GuestbookModerator initialMessages={messages} />
    </div>
  );
}
