"use client";

import { useState } from "react";
import { Conversation, Message } from "@/lib/types";
import { MESSAGES_CONTENT } from "@/lib/content";
import ReportDialog from "@/components/ReportDialog";

export default function MessagesInbox({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[];
  currentUserId: string;
}) {
  const [selected, setSelected] = useState<Conversation | null>(conversations[0] ?? null);
  const [messages, setMessages] = useState<Message[]>(selected?.messages ?? []);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  function select(c: Conversation) {
    setSelected(c);
    setMessages(c.messages ?? []);
  }

  async function send() {
    if (!selected || !body.trim()) return;
    setSending(true);
    const res = await fetch(`/api/messages/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((m) => [...m, data.message]);
      setBody("");
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="font-medium">{MESSAGES_CONTENT.empty}</p>
        <p className="text-sm mt-1">{MESSAGES_CONTENT.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4 bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="border-l border-gray-100 divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
        {conversations.map((c) => {
          const other = c.buyer_id === currentUserId ? c.seller : c.buyer;
          return (
            <button
              key={c.id}
              onClick={() => select(c)}
              className={`w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? "bg-purple-50" : ""}`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">{other?.display_name}</p>
              <p className="text-xs text-gray-400 truncate">{c.ads?.title}</p>
            </button>
          );
        })}
      </div>

      <div className="p-4 flex flex-col h-[60vh]">
        {selected && (
          <>
            <p className="text-xs text-gray-400 mb-3">{MESSAGES_CONTENT.linkedAd(selected.ads?.title ?? "")}</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${m.sender_id === currentUserId ? "bg-[#6D28D9] text-white mr-auto" : "bg-gray-100 text-gray-900"}`}>
                  {m.body}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 mb-2">
              <ReportDialog targetType="user" targetId={(selected.buyer_id === currentUserId ? selected.seller_id : selected.buyer_id)!} label={MESSAGES_CONTENT.reportMessage} />
            </div>
            <div className="flex gap-2">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={MESSAGES_CONTENT.placeholder}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send} disabled={sending} className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
                {MESSAGES_CONTENT.send}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
