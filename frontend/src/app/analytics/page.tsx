"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        Analytics
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Customer insights and trends
                    </p>
                </div>

                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 mb-4">
                            <BarChart3 className="h-8 w-8 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-800">
                            Coming Soon
                        </h3>
                        <p className="text-sm text-neutral-400 mt-1 max-w-md text-center">
                            Advanced analytics including customer trends, visit frequency,
                            popular tags, and retention metrics are on the way.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
