import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
    baseURL: BACKEND_URL,
});

export interface OrderLine {
    description: string;
    unit_price: number;
    amount: number;
    unit: string;
    total_price: number;
}

export interface ProcurementRequest {
    requestor_name: string;
    department: string;
    title: string;
    vendor_name: string;
    vat_id: string;
    commodity_group_id?: string;
    total_cost: number;
    order_lines: OrderLine[];
}
