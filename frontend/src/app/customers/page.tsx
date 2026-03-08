"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import {
    Search,
    UserPlus,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 10;

    const { data, isLoading } = useCustomers(page, limit, search || undefined);
    const deleteMutation = useDeleteCustomer();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSuccess: () => {
                toast.success("Customer deleted successfully");
                setDeleteId(null);
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Manage your restaurant&apos;s customer directory
                        </p>
                    </div>
                    <Link href="/customers/new">
                        <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 hover:from-orange-600 hover:to-amber-600">
                            <UserPlus className="h-4 w-4" />
                            Add Customer
                        </Button>
                    </Link>
                </div>

                {/* Search & Filters */}
                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                    <CardContent className="pt-4 pb-4">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search by name, email, or phone..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9 h-10 bg-neutral-50 border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-orange-300"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="rounded-xl border-neutral-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                            >
                                Search
                            </Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setSearch("");
                                        setSearchInput("");
                                        setPage(1);
                                    }}
                                    className="rounded-xl text-neutral-400 hover:text-neutral-700"
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : data?.customers && data.customers.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-neutral-200 bg-neutral-50/80">
                                            <TableHead className="font-semibold text-neutral-500 text-xs uppercase tracking-wider pl-6">
                                                Customer
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                                Email
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                                Phone
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                                Tags
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                                                Created
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-500 text-xs uppercase tracking-wider w-12">

                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.customers.map((customer) => (
                                            <TableRow
                                                key={customer.id}
                                                className="border-neutral-100 hover:bg-orange-50/30 transition-colors cursor-pointer"
                                            >
                                                <TableCell className="pl-6">
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 text-sm font-semibold shrink-0">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-neutral-900 text-sm">
                                                            {customer.name}
                                                        </span>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-500">
                                                    {customer.email}
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-500 font-mono">
                                                    {customer.phone}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {customer.tags.slice(0, 2).map((tag) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="secondary"
                                                                className="bg-orange-50 text-orange-700 text-[10px] font-medium border-orange-200 rounded-md"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {customer.tags.length > 2 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-neutral-100 text-neutral-500 text-[10px] rounded-md"
                                                            >
                                                                +{customer.tags.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-400">
                                                    {new Date(customer.created_at).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            render={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-lg hover:bg-neutral-100"
                                                                />
                                                            }
                                                        >
                                                            <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="rounded-xl shadow-lg border-neutral-200"
                                                        >
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer"
                                                                onClick={() => router.push(`/customers/${customer.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4" /> View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer"
                                                                onClick={() => router.push(`/customers/${customer.id}?edit=true`)}
                                                            >
                                                                <Pencil className="h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
                                                                onClick={() => setDeleteId(customer.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4">
                                    <p className="text-sm text-neutral-400">
                                        Showing{" "}
                                        <span className="font-medium text-neutral-700">
                                            {(page - 1) * limit + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium text-neutral-700">
                                            {Math.min(page * limit, data.total)}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium text-neutral-700">
                                            {data.total}
                                        </span>{" "}
                                        customers
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="rounded-lg border-neutral-200 h-9"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {Array.from(
                                            { length: Math.min(data.total_pages, 5) },
                                            (_, i) => i + 1
                                        ).map((p) => (
                                            <Button
                                                key={p}
                                                variant={p === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setPage(p)}
                                                className={`rounded-lg h-9 w-9 ${p === page
                                                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                                                    : "border-neutral-200"
                                                    }`}
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPage((p) => Math.min(data.total_pages, p + 1))
                                            }
                                            disabled={page >= data.total_pages}
                                            className="rounded-lg border-neutral-200 h-9"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 mb-4">
                                    <Users className="h-8 w-8 text-orange-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">
                                    No customers found
                                </h3>
                                <p className="text-sm text-neutral-400 mt-1 mb-6 text-center max-w-sm">
                                    {search
                                        ? `No results for "${search}". Try a different search term.`
                                        : "Start by adding your first customer to the directory."}
                                </p>
                                {!search && (
                                    <Link href="/customers/new">
                                        <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                            <UserPlus className="h-4 w-4" />
                                            Add Your First Customer
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the
                            customer from your directory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="rounded-xl bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
