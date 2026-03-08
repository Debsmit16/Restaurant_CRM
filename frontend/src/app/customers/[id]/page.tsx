"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Loader2,
    Mail,
    Phone,
    MapPin,
    StickyNote,
    Tag,
    Calendar,
    Save,
    X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CustomerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const { data: customer, isLoading } = useCustomer(id);
    const updateMutation = useUpdateCustomer();
    const deleteMutation = useDeleteCustomer();

    const [editing, setEditing] = useState(searchParams.get("edit") === "true");
    const [showDelete, setShowDelete] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        tags: "",
    });

    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address || "",
                notes: customer.notes || "",
                tags: customer.tags.join(", "),
            });
        }
    }, [customer]);

    const handleUpdate = () => {
        updateMutation.mutate(
            {
                id,
                data: {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    address: form.address || undefined,
                    notes: form.notes || undefined,
                    tags: form.tags
                        ? form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
                        : [],
                },
            },
            {
                onSuccess: () => {
                    toast.success("Customer updated successfully!");
                    setEditing(false);
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleDelete = () => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Customer deleted");
                router.push("/customers");
            },
            onError: (err) => toast.error(err.message),
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-48 rounded-lg" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!customer) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto text-center py-20">
                    <h2 className="text-xl font-semibold text-neutral-800">
                        Customer not found
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2">
                        The customer you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <Link href="/customers" className="mt-4 inline-block">
                        <Button variant="outline" className="rounded-xl mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Customers
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/customers">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl h-9 w-9 hover:bg-neutral-100"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg font-bold shadow-md shadow-orange-200">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                                    {customer.name}
                                </h1>
                                <p className="text-sm text-neutral-400">{customer.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!editing && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditing(true)}
                                    className="gap-2 rounded-xl border-neutral-200 hover:bg-orange-50"
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDelete(true)}
                                    className="gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-neutral-800">
                            {editing ? "Edit Customer" : "Customer Details"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {editing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-neutral-700">
                                            Full Name
                                        </Label>
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-neutral-700">
                                            Email
                                        </Label>
                                        <Input
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-neutral-700">
                                            Phone
                                        </Label>
                                        <Input
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-neutral-700">
                                            Address
                                        </Label>
                                        <Input
                                            value={form.address}
                                            onChange={(e) =>
                                                setForm({ ...form, address: e.target.value })
                                            }
                                            className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-neutral-700">
                                        Tags
                                    </Label>
                                    <Input
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        placeholder="vip, regular (comma separated)"
                                        className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-neutral-700">
                                        Notes
                                    </Label>
                                    <Textarea
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        rows={3}
                                        className="rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300 resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditing(false)}
                                        className="gap-2 rounded-xl"
                                    >
                                        <X className="h-4 w-4" /> Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdate}
                                        disabled={updateMutation.isPending}
                                        className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200"
                                    >
                                        {updateMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <DetailRow
                                    icon={<Mail className="h-4 w-4 text-neutral-400" />}
                                    label="Email"
                                    value={customer.email}
                                />
                                <DetailRow
                                    icon={<Phone className="h-4 w-4 text-neutral-400" />}
                                    label="Phone"
                                    value={customer.phone}
                                    mono
                                />
                                <DetailRow
                                    icon={<MapPin className="h-4 w-4 text-neutral-400" />}
                                    label="Address"
                                    value={customer.address || "—"}
                                />
                                <Separator className="bg-neutral-100" />
                                <div className="flex items-start gap-3">
                                    <Tag className="h-4 w-4 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                                            Tags
                                        </p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {customer.tags.length > 0 ? (
                                                customer.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="bg-orange-50 text-orange-700 text-xs border-orange-200 rounded-md"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-neutral-400">No tags</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Separator className="bg-neutral-100" />
                                <DetailRow
                                    icon={<StickyNote className="h-4 w-4 text-neutral-400" />}
                                    label="Notes"
                                    value={customer.notes || "No notes added"}
                                />
                                <DetailRow
                                    icon={<Calendar className="h-4 w-4 text-neutral-400" />}
                                    label="Created"
                                    value={new Date(customer.created_at).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {customer.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this customer from your directory.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="rounded-xl bg-red-500 hover:bg-red-600"
                        >
                            Delete Customer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}

function DetailRow({
    icon,
    label,
    value,
    mono,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {label}
                </p>
                <p
                    className={`text-sm text-neutral-800 mt-0.5 ${mono ? "font-mono" : ""
                        }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
