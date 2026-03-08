import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getStats,
    generateDemoCustomers,
    getRecentRequests,
} from "@/services/api";
import { CustomerFormData } from "@/types/customer";

export function useCustomers(page: number = 1, limit: number = 10, search?: string) {
    return useQuery({
        queryKey: ["customers", page, limit, search],
        queryFn: () => getCustomers(page, limit, search),
    });
}

export function useCustomer(id: string) {
    return useQuery({
        queryKey: ["customer", id],
        queryFn: () => getCustomer(id),
        enabled: !!id,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CustomerFormData) => createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) =>
            updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["customer"] });
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
    });
}

export function useStats() {
    return useQuery({
        queryKey: ["stats"],
        queryFn: getStats,
        refetchInterval: 30000,
    });
}

export function useGenerateDemo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: generateDemoCustomers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
    });
}

export function useRecentRequests() {
    return useQuery({
        queryKey: ["recent-requests"],
        queryFn: getRecentRequests,
        refetchInterval: 5000,
    });
}
