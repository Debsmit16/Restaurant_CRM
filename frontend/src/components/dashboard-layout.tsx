"use client";

import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-50/50">
            <Sidebar />
            <div className="ml-64">
                <TopBar />
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
