"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const customerSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Valid email required"),
    phone: z
        .string()
        .min(10, "Phone must be at least 10 characters")
        .max(15)
        .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format"),
    address: z.string().max(300).optional().or(z.literal("")),
    notes: z.string().max(1000).optional().or(z.literal("")),
    tags: z.string().optional(),
});

type FormValues = z.infer<typeof customerSchema>;

export default function AddCustomerPage() {
    const router = useRouter();
    const createMutation = useCreateCustomer();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
            tags: "",
        },
    });

    const onSubmit = (values: FormValues) => {
        const data = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address || undefined,
            notes: values.notes || undefined,
            tags: values.tags
                ? values.tags
                    .split(",")
                    .map((t) => t.trim().toLowerCase())
                    .filter(Boolean)
                : [],
        };

        createMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Customer created successfully!");
                reset();
                router.push("/customers");
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
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
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                            Add Customer
                        </h1>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Register a new customer to your directory
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold text-neutral-800">
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Name & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium text-neutral-700"
                                    >
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        {...register("name")}
                                        className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium text-neutral-700"
                                    >
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        {...register("email")}
                                        className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone & Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-sm font-medium text-neutral-700"
                                    >
                                        Phone <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91 9999999999"
                                        {...register("phone")}
                                        className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-500">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="address"
                                        className="text-sm font-medium text-neutral-700"
                                    >
                                        Address
                                    </Label>
                                    <Input
                                        id="address"
                                        placeholder="Kolkata, India"
                                        {...register("address")}
                                        className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="tags"
                                    className="text-sm font-medium text-neutral-700"
                                >
                                    Tags
                                </Label>
                                <Input
                                    id="tags"
                                    placeholder="vip, regular, vegetarian (comma separated)"
                                    {...register("tags")}
                                    className="h-10 rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300"
                                />
                                <p className="text-[11px] text-neutral-400">
                                    Separate multiple tags with commas
                                </p>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="notes"
                                    className="text-sm font-medium text-neutral-700"
                                >
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Any special preferences, allergies, or notes..."
                                    rows={3}
                                    {...register("notes")}
                                    className="rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white focus:border-orange-300 resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Link href="/customers">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl border-neutral-200"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 hover:from-orange-600 hover:to-amber-600"
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="h-4 w-4" />
                                    )}
                                    Create Customer
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
