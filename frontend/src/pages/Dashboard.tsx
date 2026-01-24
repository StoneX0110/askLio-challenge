import { useEffect, useState } from "react";

import { api, type ProcurementRequest } from "../services/api";
import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";
import { COMMODITY_OPTIONS } from "../services/constants";

// Extended interface with ID and created_at
interface RequestResponse extends ProcurementRequest {
    id: number;
    status: string;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    "Open": "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    "Closed": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
};

export default function Dashboard() {
    const [requests, setRequests] = useState<RequestResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);

    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchRequests = async () => {
        try {
            const res = await api.get<RequestResponse[]>("/requests/");
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            setToast({ type: "error", text: "Failed to load requests." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleStatusChange = async (id: number, newStatus: string) => {
        // Optimistic update
        setRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );

        try {
            await api.put(`/requests/${id}/status`, { status: newStatus });
            setToast({ type: "success", text: "Status updated" });
        } catch (err) {
            console.error("Failed to update status", err);
            setToast({ type: "error", text: "Failed to update status" });
            fetchRequests();
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto relative">
            {/* Simple Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-300 z-50",
                    toast.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                )}>
                    {toast.text}
                </div>
            )}

            <h1 className="text-3xl font-bold mb-8">📊 Procurement Overview</h1>

            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-16">ID</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendor</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Cost</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-40">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No requests found.
                                </td>
                            </tr>
                        )}
                        {requests.map((req) => (
                            <>
                                <tr
                                    key={req.id}
                                    className={cn(
                                        "border-b transition-colors hover:bg-muted/30 cursor-pointer",
                                        expandedRequestId === req.id ? "bg-muted/30" : ""
                                    )}
                                    onClick={() => setExpandedRequestId(expandedRequestId === req.id ? null : req.id)}
                                >
                                    <td className="p-4 align-middle font-medium">{req.id}</td>
                                    <td className="p-4 align-middle">{req.title}</td>
                                    <td className="p-4 align-middle">{req.vendor_name}</td>
                                    <td className="p-4 align-middle font-medium">
                                        €{req.total_cost.toFixed(2)}
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            className={cn(
                                                "h-8 rounded-md border-0 pl-2 pr-8 text-xs font-semibold ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer",
                                                STATUS_COLORS[req.status] || "bg-gray-100 text-gray-700"
                                            )}
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                                {expandedRequestId === req.id && (
                                    <tr className="bg-muted/10">
                                        <td colSpan={6} className="p-6 border-b">
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                                                <div>
                                                    <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Requestor</span>
                                                    <span className="text-sm font-medium">{req.requestor_name} ({req.department})</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Commodity Group</span>
                                                    <span className="text-sm font-medium">
                                                        {req.commodity_group_id} - {COMMODITY_OPTIONS[req.commodity_group_id as keyof typeof COMMODITY_OPTIONS] || "Unknown"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor</span>
                                                    <span className="text-sm font-medium">{req.vendor_name}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">VAT ID</span>
                                                    <span className="text-sm font-medium">{req.vat_id || "-"}</span>
                                                </div>
                                            </div>

                                            <h4 className="text-sm font-semibold mb-3">Order Lines</h4>
                                            <div className="rounded-md border bg-background overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted/50">
                                                        <tr className="border-b">
                                                            <th className="py-2 px-4 text-left font-medium text-muted-foreground">Description</th>
                                                            <th className="py-2 px-4 text-right font-medium text-muted-foreground">Unit Price</th>
                                                            <th className="py-2 px-4 text-right font-medium text-muted-foreground">Quantity</th>
                                                            <th className="py-2 px-4 text-left font-medium text-muted-foreground">Unit</th>
                                                            <th className="py-2 px-4 text-right font-medium text-muted-foreground">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {req.order_lines.map((line, idx) => (
                                                            <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                                                                <td className="py-2 px-4">{line.description}</td>
                                                                <td className="py-2 px-4 text-right">€{line.unit_price.toFixed(2)}</td>
                                                                <td className="py-2 px-4 text-right">{line.amount}</td>
                                                                <td className="py-2 px-4">{line.unit}</td>
                                                                <td className="py-2 px-4 text-right">€{line.total_price.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
