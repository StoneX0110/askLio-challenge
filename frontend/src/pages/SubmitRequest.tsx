import { useState } from "react";
import { Upload, Plus, Trash2, Loader2, Save } from "lucide-react";
import { api, type ProcurementRequest, type OrderLine } from "../services/api";
import { cn } from "../lib/utils";

const INITIAL_STATE: ProcurementRequest = {
    requestor_name: "",
    department: "",
    title: "",
    vendor_name: "",
    vat_id: "",
    total_cost: 0,
    order_lines: [],
};

// Reusable styles for consistency without extra components
const INPUT_CLASS = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_BASE = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const BTN_PRIMARY = "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2";
const BTN_OUTLINE = "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3";
const BTN_GHOST = "hover:bg-accent hover:text-accent-foreground h-10 w-10";

export default function SubmitRequest() {
    const [formData, setFormData] = useState<ProcurementRequest>(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setExtracting(true);
        setToast(null);
        const form = new FormData();
        form.append("file", file);

        try {
            const res = await api.post<ProcurementRequest>("/extract", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Merge extracted data but keep order lines array even if empty
            setFormData({ ...res.data, order_lines: res.data.order_lines || [] });
            setToast({ type: "success", text: "Data extracted successfully!" });
        } catch (err) {
            console.error(err);
            setToast({ type: "error", text: "Failed to extract data from PDF." });
        } finally {
            setExtracting(false);
        }
    };

    const updateField = (field: keyof ProcurementRequest, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateLine = (index: number, field: keyof OrderLine, value: string | number) => {
        const newLines = [...formData.order_lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setFormData((prev) => ({ ...prev, order_lines: newLines }));
    };

    const addLine = () => {
        setFormData((prev) => ({
            ...prev,
            order_lines: [
                ...prev.order_lines,
                { description: "", unit_price: 0, amount: 0, unit: "", total_price: 0 },
            ],
        }));
    };

    const removeLine = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            order_lines: prev.order_lines.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);
        try {
            await api.post("/requests/", formData);
            setToast({ type: "success", text: "Request submitted successfully!" });
            setFormData(INITIAL_STATE);
        } catch (err) {
            console.error(err);
            setToast({ type: "error", text: "Failed to submit request." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <h1 className="text-3xl font-bold mb-8">📝 New Procurement Request</h1>

            {/* 1. Upload Section */}
            <section className="mb-10 p-6 bg-card rounded-lg border shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5" /> 1. Auto-Fill from Document
                </h2>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className={cn(INPUT_CLASS, "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-12 pt-1.5")}
                    />
                    {extracting && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
            </section>

            {/* 2. Form Section */}
            <form onSubmit={handleSubmit} className="space-y-8">
                <section className="p-6 bg-card rounded-lg border shadow-sm space-y-6">
                    <h2 className="text-lg font-semibold border-b pb-2">2. Verify & Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Requestor Name</label>
                            <input
                                className={INPUT_CLASS}
                                value={formData.requestor_name}
                                onChange={(e) => updateField("requestor_name", e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <input
                                className={INPUT_CLASS}
                                value={formData.department}
                                onChange={(e) => updateField("department", e.target.value)}
                                placeholder="Engineering"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vendor Name</label>
                            <input
                                className={INPUT_CLASS}
                                value={formData.vendor_name}
                                onChange={(e) => updateField("vendor_name", e.target.value)}
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title/Description</label>
                            <input
                                className={INPUT_CLASS}
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="Annual Software License"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">VAT ID</label>
                            <input
                                className={INPUT_CLASS}
                                value={formData.vat_id}
                                onChange={(e) => updateField("vat_id", e.target.value)}
                                placeholder="DE123456789"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Order Lines */}
                <section className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">3. Order Lines</h2>
                        <button type="button" className={cn(BUTTON_BASE, BTN_OUTLINE)} onClick={addLine}>
                            <Plus className="h-4 w-4 mr-2" /> Add Line
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left font-medium p-2 w-[40%]">Description</th>
                                    <th className="text-left font-medium p-2">Price</th>
                                    <th className="text-left font-medium p-2">Amount</th>
                                    <th className="text-left font-medium p-2">Unit</th>
                                    <th className="text-left font-medium p-2">Total</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.order_lines.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No order lines added. Click "Add Line" or upload a PDF.
                                        </td>
                                    </tr>
                                )}
                                {formData.order_lines.map((line, index) => (
                                    <tr key={index} className="border-b group hover:bg-muted/30 transition-colors">
                                        <td className="p-2">
                                            <input
                                                className={cn(INPUT_CLASS, "h-8")}
                                                value={line.description}
                                                onChange={(e) => updateLine(index, "description", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className={cn(INPUT_CLASS, "h-8")}
                                                value={line.unit_price}
                                                onChange={(e) => updateLine(index, "unit_price", parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className={cn(INPUT_CLASS, "h-8 w-20")}
                                                value={line.amount}
                                                onChange={(e) => updateLine(index, "amount", parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                className={cn(INPUT_CLASS, "h-8 w-20")}
                                                value={line.unit}
                                                onChange={(e) => updateLine(index, "unit", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className={cn(INPUT_CLASS, "h-8")}
                                                value={line.total_price}
                                                onChange={(e) => updateLine(index, "total_price", parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 text-right">
                                            <button
                                                type="button"
                                                className={cn(BUTTON_BASE, BTN_GHOST, "h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10")}
                                                onClick={() => removeLine(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <div className="w-1/3 space-y-2">
                            <label className="text-sm font-medium block text-right">Total Cost</label>
                            <input
                                type="number"
                                className={cn(INPUT_CLASS, "text-right font-bold")}
                                value={formData.total_cost}
                                onChange={(e) => updateField("total_cost", parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </section>

                {/* 4. Action Bar */}
                <div className="flex items-center justify-between pb-10">
                    {toast && (
                        <div className={cn("px-4 py-2 rounded-md", toast.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                            {toast.text}
                        </div>
                    )}
                    {!toast && <div></div>} {/* Spacer */}

                    <button type="submit" disabled={loading} className={cn(BUTTON_BASE, BTN_PRIMARY, "w-40")}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!loading && <Save className="mr-2 h-4 w-4" />}
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}
