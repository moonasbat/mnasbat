"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Conversation, Message } from "@/lib/types";
import { MESSAGES_CONTENT } from "@/lib/content";
import { formatRelativeTime } from "@/lib/formatTime";
import ReportDialog from "@/components/ReportDialog";
import BlockUserButton from "@/components/BlockUserButton";

function hasUnread(c: Conversation, currentUserId: string) {
  return (c.messages ?? []).some((m) => m.sender_id !== currentUserId && !m.is_read);
}

function lastMessageTime(c: Conversation) {
  const msgs = c.messages ?? [];
  return msgs.length ? msgs[msgs.length - 1].created_at : c.created_at;
}

function Avatar({ name, url, size = 40 }: { name?: string; url?: string | null; size?: number }) {
  return (
    <div
      className="rounded-full bg-[#6D28D9] text-white flex items-center justify-center font-bold shrink-0 overflow-hidden"
      style={{ width: size, height: size, fontSize: size / 2.2 }}
    >
      {url ? <Image src={url} alt={name ?? ""} width={size} height={size} className="object-cover w-full h-full" /> : (name?.charAt(0) ?? "؟")}
    </div>
  );
}

export default function MessagesInbox({
  conversations,
  currentUserId,
  initialConversationId,
}: {
  conversations: Conversation[];
  currentUserId: string;
  initialConversationId?: string;
}) {
  const [convos, setConvos] = useState(conversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId && conversations.some((c) => c.id === initialConversationId) ? initialConversationId : null
  );
  const [messages, setMessages] = useState<Message[]>(
    conversations.find((c) => c.id === initialConversationId)?.messages ?? []
  );
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

  function backToList() {
    setSelectedId(null);
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
  const otherUser = selected ? (selected.buyer_id === currentUserId ? selected.seller : selected.buyer) : null;

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4 bg-white border border-gray-100 rounded-2xl overflow-hidden min-w-0">
      {/* قائمة المحادثات — تختفي على الجوال عند فتح محادثة */}
      <div className={`min-w-0 border-l border-gray-100 divide-y divide-gray-100 max-h-[70vh] overflow-y-auto ${selected ? "hidden md:block" : ""}`}>
        {convos.map((c) => {
          const other = c.buyer_id === currentUserId ? c.seller : c.buyer;
          const unread = hasUnread(c, currentUserId);
          const msgs = c.messages ?? [];
          const lastBody = msgs.length ? msgs[msgs.length - 1].body : "";
          return (
            <button
              key={c.id}
              onClick={() => select(c)}
              className={`w-full min-w-0 flex items-center gap-3 text-right px-4 py-3 hover:bg-gray-50 transition-colors ${selectedId === c.id ? "bg-purple-50" : ""}`}
            >
              <Avatar name={other?.display_name} url={other?.avatar_url} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className={`min-w-0 truncate text-sm ${unread ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>{other?.display_name}</p>
                  <span className="text-[11px] text-gray-400 shrink-0">{formatRelativeTime(lastMessageTime(c))}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{lastBody || c.ads?.title}</p>
              </div>
              {unread && <span className="w-2 h-2 rounded-full bg-[#6D28D9] shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* المحادثة المفتوحة — تظهر لوحدها على الجوال بزر رجوع للقائمة */}
      <div className={`min-w-0 p-4 flex flex-col h-[70vh] ${selected ? "" : "hidden md:flex"}`}>
        {selected ? (
          <>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 min-w-0">
              <button onClick={backToList} className="md:hidden text-gray-400 p-1 -mr-1 shrink-0" aria-label="رجوع">
                <ChevronRight size={20} />
              </button>
              {otherUserId && (
                <Link href={`/profile/${otherUserId}`} className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80">
                  <Avatar name={otherUser?.display_name} url={otherUser?.avatar_url} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{otherUser?.display_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{MESSAGES_CONTENT.linkedAd(selected.ads?.title ?? "")}</p>
                  </div>
                </Link>
              )}
              {otherUserId && <div className="shrink-0"><BlockUserButton userId={otherUserId} isLoggedIn={true} /></div>}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 min-w-0">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[75%] min-w-0 flex flex-col ${m.sender_id === currentUserId ? "items-end mr-0 ml-auto" : "items-start"}`}>
                  <div className={`min-w-0 max-w-full rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-line ${m.sender_id === currentUserId ? "bg-[#6D28D9] text-white" : "bg-gray-100 text-gray-900"}`}>
                    {m.body}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{formatRelativeTime(m.created_at)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end mt-2 mb-2 min-w-0">
              {otherUserId && <ReportDialog targetType="user" targetId={otherUserId} label={MESSAGES_CONTENT.reportMessage} />}
            </div>
            <div className="flex gap-2 min-w-0">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={MESSAGES_CONTENT.placeholder}
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send} disabled={sending} className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
                {MESSAGES_CONTENT.send}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">اختر محادثة لعرضها</div>
        )}
      </div>
    </div>
  );
}
