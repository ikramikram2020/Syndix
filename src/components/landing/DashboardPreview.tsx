import { useState } from "react";
import {
  Bell,
  Search,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  QrCode,
  Home,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

function SyndicDashboard() {
  const payments = [
    {
      name: "Ahmed Benali",
      apt: "Apt 3B",
      amount: "DZD 2,500",
      status: "Paid",
      date: "Apr 12",
    },
    {
      name: "Fatima Zerhouni",
      apt: "Apt 1A",
      amount: "DZD 2,500",
      status: "Paid",
      date: "Apr 11",
    },
    {
      name: "Karim Meziane",
      apt: "Apt 5C",
      amount: "DZD 3,000",
      status: "Pending",
      date: "Apr 09",
    },
    {
      name: "Sara Hadj",
      apt: "Apt 2D",
      amount: "DZD 2,500",
      status: "Overdue",
      date: "Mar 30",
    },
  ];

  const tickets = [
    {
      title: "Elevator malfunction - Floor 4",
      priority: "High",
      apt: "Apt 4A",
      time: "2h ago",
    },
    {
      title: "Water leak in corridor",
      priority: "Medium",
      apt: "Apt 2B",
      time: "5h ago",
    },
    {
      title: "Broken hallway light",
      priority: "Low",
      apt: "Apt 1C",
      time: "1d ago",
    },
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden min-h-[520px] border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 bg-brand-bg border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center text-xs font-bold text-white">
            S
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Syndix</p>
            <p className="text-[10px] text-slate-500">Building Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="bg-white border border-slate-200 rounded-lg ps-8 pe-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 w-32 focus:outline-none focus:border-brand-teal"
              placeholder="Search..."
            />
          </div>
          <div className="relative">
            <Bell
              size={17}
              className="text-slate-400 cursor-pointer hover:text-brand-navy transition-colors"
            />
            <span className="absolute -top-1 -end-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center font-bold text-white">
              3
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              icon: Users,
              label: "Residents",
              value: "124",
              change: "+4",
              color: "navy",
            },
            {
              icon: CreditCard,
              label: "Collections",
              value: "93%",
              change: "+2%",
              color: "teal",
            },
            {
              icon: AlertCircle,
              label: "Open Tickets",
              value: "7",
              change: "-3",
              color: "orange",
            },
            {
              icon: TrendingUp,
              label: "Revenue",
              value: "DZD 284K",
              change: "+12%",
              color: "emerald",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-brand-bg border border-slate-200 rounded-xl p-3"
            >
              <div
                className={`w-7 h-7 rounded-lg mb-2 flex items-center justify-center ${
                  s.color === "navy"
                    ? "bg-brand-navy/10"
                    : s.color === "teal"
                      ? "bg-brand-teal/10"
                      : s.color === "orange"
                        ? "bg-orange-100"
                        : "bg-emerald-100"
                }`}
              >
                <s.icon
                  size={14}
                  className={
                    s.color === "navy"
                      ? "text-brand-navy"
                      : s.color === "teal"
                        ? "text-brand-teal"
                        : s.color === "orange"
                          ? "text-orange-500"
                          : "text-emerald-600"
                  }
                />
              </div>
              <p className="text-[10px] text-slate-500 mb-0.5">{s.label}</p>
              <p className="text-sm font-bold text-slate-800">{s.value}</p>
              <p
                className={`text-[9px] font-semibold ${s.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
              >
                {s.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-bg border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700">
                Recent Payments
              </p>
              <span className="text-[10px] text-brand-teal cursor-pointer hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={10} />
              </span>
            </div>
            <div className="space-y-2.5">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center text-[9px] font-bold text-white">
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700 leading-none">
                        {p.name}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {p.apt} · {p.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-slate-700">
                      {p.amount}
                    </p>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        p.status === "Paid"
                          ? "bg-emerald-100 text-emerald-600"
                          : p.status === "Pending"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-bg border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700">Open Tickets</p>
              <span className="text-[10px] text-brand-teal cursor-pointer hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={10} />
              </span>
            </div>
            <div className="space-y-2.5">
              {tickets.map((tk, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-2.5 border border-slate-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-semibold text-slate-700 leading-snug flex-1">
                      {tk.title}
                    </p>
                    <span
                      className={`flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        tk.priority === "High"
                          ? "bg-red-100 text-red-500"
                          : tk.priority === "Medium"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tk.priority}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {tk.apt} · {tk.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentDashboard() {
  const announcements = [
    {
      title: "Building maintenance this Saturday",
      time: "2h ago",
      urgent: true,
    },
    { title: "Monthly fees due by April 30", time: "1d ago", urgent: false },
    {
      title: "New parking rules effective May 1",
      time: "3d ago",
      urgent: false,
    },
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden min-h-[520px] border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 bg-brand-bg border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-amber to-orange-400 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Ahmed Benali</p>
            <p className="text-[10px] text-slate-500">Apt 3B · Floor 3</p>
          </div>
        </div>
        <div className="relative">
          <Bell size={17} className="text-slate-400" />
          <span className="absolute -top-1 -end-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center font-bold text-white">
            3
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: CreditCard,
              label: "Balance",
              value: "Paid",
              sub: "April 2025",
              color: "emerald",
            },
            {
              icon: AlertCircle,
              label: "My Tickets",
              value: "1 Open",
              sub: "In Progress",
              color: "orange",
            },
            {
              icon: Bell,
              label: "Notices",
              value: "3 New",
              sub: "Unread",
              color: "navy",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-brand-bg border rounded-xl p-3 ${
                s.color === "emerald"
                  ? "border-emerald-200"
                  : s.color === "orange"
                    ? "border-orange-200"
                    : "border-brand-navy/15"
              }`}
            >
              <s.icon
                size={16}
                className={`mb-2 ${
                  s.color === "emerald"
                    ? "text-emerald-600"
                    : s.color === "orange"
                      ? "text-orange-500"
                      : "text-brand-navy"
                }`}
              />
              <p className="text-[10px] text-slate-500">{s.label}</p>
              <p className="text-xs font-bold text-slate-800">{s.value}</p>
              <p className="text-[9px] text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-bg border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
            <QrCode size={14} className="text-brand-teal" />
            My Access QR Code
          </p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl p-2 flex-shrink-0">
              <div className="w-full h-full grid grid-cols-6 gap-px">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[1px] ${[0, 1, 2, 3, 4, 5, 6, 11, 12, 17, 18, 23, 24, 29, 30, 35, 7, 8, 13, 14, 19, 20, 25, 26, 31, 32].includes(i) ? "bg-brand-navy" : "bg-transparent"}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan this QR code at the building entrance for contactless
                access.
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Active & Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-bg border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 mb-3">Announcements</p>
          <div className="space-y-2">
            {announcements.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg ${a.urgent ? "bg-red-50 border border-red-100" : "bg-white border border-slate-200"}`}
              >
                <Home
                  size={12}
                  className={`mt-0.5 flex-shrink-0 ${a.urgent ? "text-red-500" : "text-slate-400"}`}
                />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-700">
                    {a.title}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
                {a.urgent && (
                  <span className="text-[8px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"syndic" | "resident">("syndic");

  return (
    <section id="dashboard" className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-navy bg-brand-navy/8 border border-brand-navy/15 rounded-full mb-4">
            {t.dashboard.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {t.dashboard.headline}
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            {t.dashboard.subheadline}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
            {(["syndic", "resident"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.dashboard.tabs[tab]}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-navy/5 via-brand-teal/5 to-brand-amber/5 rounded-3xl blur-xl" />
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/60">
              <div className="flex items-center gap-1.5 px-5 py-3 bg-slate-100 border-b border-slate-200">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ms-3 text-xs text-slate-400 font-mono">
                  {activeTab === "syndic"
                    ? "syndix.app/dashboard"
                    : "syndix.app/resident"}
                </span>
              </div>
              {activeTab === "syndic" ? (
                <SyndicDashboard />
              ) : (
                <ResidentDashboard />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
