"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/useCustomers";

export default function TopBar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { data } = useCustomers(1, 5, searchQuery || undefined);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 backdrop-blur-md px-8">
            {/* Left */}
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-neutral-800">
                    {getGreeting()}
                </h2>
            </div>

            {/* Center — Global Search */}
            <div ref={searchRef} className="relative w-full max-w-md mx-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => searchQuery && setShowResults(true)}
                        className="pl-9 pr-9 h-10 bg-neutral-50 border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:bg-white focus:border-orange-300 focus:ring-orange-100 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setShowResults(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/50 z-50">
                        {data?.customers && data.customers.length > 0 ? (
                            <>
                                <div className="px-4 py-2.5 border-b border-neutral-100">
                                    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                                        {data.total} result{data.total !== 1 ? "s" : ""} found
                                    </p>
                                </div>
                                {data.customers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        onClick={() => {
                                            router.push(`/customers/${customer.id}`);
                                            setShowResults(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-neutral-50 last:border-0"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 text-xs font-semibold">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 truncate">
                                                {customer.name}
                                            </p>
                                            <p className="text-xs text-neutral-400 truncate">
                                                {customer.email}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-neutral-500">No customers found</p>
                                <p className="text-xs text-neutral-400 mt-1">
                                    Try a different search term
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">A</span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-neutral-800 leading-tight">Admin</p>
                        <p className="text-[11px] text-neutral-400 leading-tight">Manager</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning ☀️";
    if (hour < 18) return "Good afternoon 🌤️";
    return "Good evening 🌙";
}
