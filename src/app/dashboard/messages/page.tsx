import { createClient } from "@/lib/supabase/server";
import MessagesInbox from "@/components/dashboard/MessagesInbox";
import { MESSAGES_CONTENT } from "@/lib/content";

export default async function DashboardMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, ads(title, id), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*), messages(*)")
    .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">{MESSAGES_CONTENT.title}</h1>
      <MessagesInbox conversations={conversations ?? []} currentUserId={user!.id} />
    </div>
  );
}
