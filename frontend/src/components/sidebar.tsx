"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    BarChart3,
    Utensils,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/customers/new", label: "Add Customer", icon: UserPlus },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white flex flex-col">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm">
                    <Utensils className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-base font-semibold text-neutral-900 tracking-tight">
                        TableCRM
                    </h1>
                    <p className="text-[11px] text-neutral-400 tracking-wide uppercase">
                        Restaurant
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="px-3 pb-2 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Menu
                </p>
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                                    ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                                }`}
                        >
                            <item.icon
                                className={`h-[18px] w-[18px] ${isActive ? "text-orange-600" : "text-neutral-400"
                                    }`}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-neutral-200 px-4 py-4">
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-3 border border-orange-100">
                    <p className="text-xs font-medium text-orange-800">Pro Tip</p>
                    <p className="text-[11px] text-orange-600 mt-1 leading-relaxed">
                        Use global search in the top bar to quickly find any customer.
                    </p>
                </div>
            </div>
        </aside>
    );
}
