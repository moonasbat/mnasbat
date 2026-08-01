"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#6D28D9", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#F97316"];

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

export function DailySeriesChart({ data }: { data: { date: string; ads: number; users: number }[] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="font-bold text-gray-900 mb-4">النشاط اليومي — آخر 30 يوماً</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6D28D9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
          <Tooltip contentStyle={{ ...TOOLTIP_STYLE, direction: "rtl" }} />
          <Area type="monotone" dataKey="ads" name="إعلانات جديدة" stroke="#6D28D9" fill="url(#colorAds)" strokeWidth={2} />
          <Area type="monotone" dataKey="users" name="مستخدمون جدد" stroke="#10B981" fill="url(#colorUsers)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDistributionChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="font-bold text-gray-900 mb-4">توزيع الإعلانات على التصنيفات</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">لا توجد بيانات كافية بعد.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function CommissionChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h2 className="font-bold text-gray-900 mb-4">العمولات المعتمدة — آخر 30 يوماً</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toLocaleString("en-US")} ر.س`, "المبلغ"]} />
          <Bar dataKey="amount" name="المبلغ" fill="#6D28D9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
