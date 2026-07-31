"use client";

import { useEffect, useRef, useState } from "react";
import { Conversation, Message } from "@/lib/types";
import { MESSAGES_CONTENT } from "@/lib/content";
import ReportDialog from "@/components/ReportDialog";
import BlockUserButton from "@/components/BlockUserButton";

function hasUnread(c: Conversation, currentUserId: string) {
  return (c.messages ?? []).some((m) => m.sender_id !== currentUserId && !m.is_read);
}

export default function MessagesInbox({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[];
  currentUserId: string;
}) {
  const [convos, setConvos] = useState(conversations);
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>(conversations[0]?.messages ?? []);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = convos.find((c) => c.id === selectedId) ?? null;

  async function markRead(conversationId: string) {
    await fetch(`/api/messages/${conversationId}`, { method: "PATCH" });
    setConvos((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: (c.messages ?? []).map((m) => (m.sender_id !== currentUserId ? { ...m, is_read: true } : m)) }
          : c
      )
    );
  }

  function select(c: Conversation) {
    setSelectedId(c.id);
    setMessages(c.messages ?? []);
    if (hasUnread(c, currentUserId)) markRead(c.id);
  }

  // استطلاع دوري لجلب أي رسائل جديدة في المحادثة المفتوحة دون الحاجة لتحديث الصفحة
  useEffect(() => {
    const currentId = selectedId;
    if (!currentId) return;
    if (hasUnread(selected!, currentUserId)) markRead(currentId);

    async function poll(conversationId: string) {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (!res.ok) return;
      const data = await res.json();
      const fresh = (data.messages ?? []) as Message[];
      setMessages(fresh);
      if (fresh.some((m) => m.sender_id !== currentUserId && !m.is_read)) markRead(conversationId);
    }

    pollRef.current = setInterval(() => poll(currentId), 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

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

  if (convos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="font-medium">{MESSAGES_CONTENT.empty}</p>
        <p className="text-sm mt-1">{MESSAGES_CONTENT.emptyBody}</p>
      </div>
    );
  }

  const otherUserId = selected ? (selected.buyer_id === currentUserId ? selected.seller_id : selected.buyer_id) : null;

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4 bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="border-l border-gray-100 divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
        {convos.map((c) => {
          const other = c.buyer_id === currentUserId ? c.seller : c.buyer;
          const unread = hasUnread(c, currentUserId);
          return (
            <button
              key={c.id}
              onClick={() => select(c)}
              className={`w-full flex items-center justify-between gap-2 text-right px-4 py-3 hover:bg-gray-50 transition-colors ${selectedId === c.id ? "bg-purple-50" : ""}`}
            >
              <div className="min-w-0">
                <p className={`text-sm truncate ${unread ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>{other?.display_name}</p>
                <p className="text-xs text-gray-400 truncate">{c.ads?.title}</p>
              </div>
              {unread && <span className="w-2 h-2 rounded-full bg-[#6D28D9] shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="p-4 flex flex-col h-[60vh]">
        {selected && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">{MESSAGES_CONTENT.linkedAd(selected.ads?.title ?? "")}</p>
              {otherUserId && <BlockUserButton userId={otherUserId} isLoggedIn={true} />}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${m.sender_id === currentUserId ? "bg-[#6D28D9] text-white mr-auto" : "bg-gray-100 text-gray-900"}`}>
                  {m.body}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 mb-2">
              {otherUserId && <ReportDialog targetType="user" targetId={otherUserId} label={MESSAGES_CONTENT.reportMessage} />}
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
