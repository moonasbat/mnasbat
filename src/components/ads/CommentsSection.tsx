"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Comment } from "@/lib/types";
import { COMMENTS_CONTENT } from "@/lib/content";
import ReportDialog from "@/components/ReportDialog";
import { loginUrl } from "@/lib/loginRedirect";
import { profileUrl } from "@/lib/profileUrl";

export default function CommentsSection({
  adId,
  initialComments,
  enabled,
  isLoggedIn,
  currentUserId,
}: {
  adId: string;
  initialComments: Comment[];
  enabled: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function submit() {
    if (!isLoggedIn) return router.push(loginUrl(pathname));
    if (!body.trim()) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: adId, body }),
    });
    setPosting(false);
    if (res.ok) {
      const data = await res.json();
      setComments((c) => [data.comment, ...c]);
      setBody("");
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="font-bold text-gray-900 mb-4">{COMMENTS_CONTENT.title}</h2>

      {enabled && (
        <div className="flex gap-2 mb-5">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={COMMENTS_CONTENT.placeholder}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <button onClick={submit} disabled={posting} className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
            {COMMENTS_CONTENT.submit}
          </button>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">{COMMENTS_CONTENT.empty}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Link href={profileUrl(c.profiles ?? { id: c.user_id })} className="w-8 h-8 rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                {c.profiles?.avatar_url ? (
                  <Image src={c.profiles.avatar_url} alt={c.profiles.display_name} width={32} height={32} className="object-cover w-full h-full" />
                ) : (
                  c.profiles?.display_name?.charAt(0) ?? "?"
                )}
              </Link>
              <div className="flex-1">
                <Link href={profileUrl(c.profiles ?? { id: c.user_id })} className="text-sm font-medium text-gray-900 hover:text-[#6D28D9] hover:underline">
                  {c.profiles?.display_name}
                </Link>
                <p className="text-sm text-gray-700 mt-0.5">{c.body}</p>
                <div className="flex gap-3 mt-1">
                  {c.user_id === currentUserId && (
                    <span className="text-xs text-gray-400">{COMMENTS_CONTENT.delete}</span>
                  )}
                  <ReportDialog targetType="comment" targetId={c.id} label={COMMENTS_CONTENT.report} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
