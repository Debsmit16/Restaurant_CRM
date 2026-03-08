"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useStats, useGenerateDemo, useRecentRequests } from "@/hooks/useCustomers";
import {
  Users,
  UserPlus,
  CalendarDays,
  Sparkles,
  Activity,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: metricsData, isLoading: metricsLoading } = useRecentRequests();
  const generateDemo = useGenerateDemo();

  const handleGenerateDemo = () => {
    generateDemo.mutate(undefined, {
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Overview of your restaurant&apos;s customer activity
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateDemo}
              disabled={generateDemo.isPending}
              variant="outline"
              className="gap-2 rounded-xl border-dashed border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
            >
              {generateDemo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Demo Data
            </Button>
            <Link href="/customers/new">
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 hover:from-orange-600 hover:to-amber-600">
                <UserPlus className="h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Customers"
            value={stats?.total_customers}
            loading={statsLoading}
            icon={<Users className="h-5 w-5" />}
            gradient="from-blue-500 to-indigo-500"
            bgLight="bg-blue-50"
            textColor="text-blue-700"
          />
          <StatsCard
            title="New Today"
            value={stats?.customers_today}
            loading={statsLoading}
            icon={<UserPlus className="h-5 w-5" />}
            gradient="from-emerald-500 to-teal-500"
            bgLight="bg-emerald-50"
            textColor="text-emerald-700"
          />
          <StatsCard
            title="This Week"
            value={stats?.customers_this_week}
            loading={statsLoading}
            icon={<CalendarDays className="h-5 w-5" />}
            gradient="from-orange-500 to-amber-500"
            bgLight="bg-orange-50"
            textColor="text-orange-700"
          />
        </div>

        {/* Quick Actions & Activity Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 border-neutral-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-neutral-800">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/customers/new" className="block">
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        Add New Customer
                      </p>
                      <p className="text-xs text-neutral-400">
                        Register a new guest
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-orange-500 transition-colors" />
                </div>
              </Link>
              <Link href="/customers" className="block">
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        View All Customers
                      </p>
                      <p className="text-xs text-neutral-400">
                        Browse customer directory
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Activity Panel */}
          <Card className="lg:col-span-3 border-neutral-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-base font-semibold text-neutral-800">
                    API Activity
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 text-[11px] font-medium border-emerald-200"
                >
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : metricsData?.requests && metricsData.requests.length > 0 ? (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {metricsData.requests
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((req, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5 text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <MethodBadge method={req.method} />
                          <span className="text-neutral-600 truncate max-w-[200px]">
                            {req.endpoint}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge code={req.status_code} />
                          <span className="text-neutral-400 w-16 text-right">
                            {req.response_time}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-8 w-8 text-neutral-200 mb-2" />
                  <p className="text-sm text-neutral-400">No activity yet</p>
                  <p className="text-xs text-neutral-300 mt-1">
                    API requests will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatsCard({
  title,
  value,
  loading,
  icon,
  gradient,
  bgLight,
  textColor,
}: {
  title: string;
  value?: number;
  loading: boolean;
  icon: React.ReactNode;
  gradient: string;
  bgLight: string;
  textColor: string;
}) {
  return (
    <Card className="border-neutral-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            {loading ? (
              <Skeleton className="h-9 w-20 mt-2 rounded-lg" />
            ) : (
              <p className="text-3xl font-bold text-neutral-900 mt-1 tracking-tight">
                {value ?? 0}
              </p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgLight} ${textColor}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-emerald-100 text-emerald-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${colors[method] || "bg-neutral-100 text-neutral-600"
        }`}
    >
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const color =
    code >= 200 && code < 300
      ? "text-emerald-600"
      : code >= 400
        ? "text-red-500"
        : "text-neutral-500";
  return <span className={`font-medium ${color}`}>{code}</span>;
}
