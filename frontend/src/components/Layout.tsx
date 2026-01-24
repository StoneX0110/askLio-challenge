import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../lib/utils";
import { FileText, BarChart3 } from "lucide-react";

export default function Layout() {
    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
                <div className="flex items-center gap-2 px-2 mb-8">
                    <img src="/askLioLogo.jfif" alt="askLio Logo" className="h-8 w-8 rounded-md object-cover" />
                    <h1 className="text-xl font-bold tracking-tight">askLio</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <div className="px-2 mb-2 text-sm font-semibold text-muted-foreground">Navigation</div>

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <FileText className="h-4 w-4" />
                        Submit Request
                    </NavLink>

                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <BarChart3 className="h-4 w-4" />
                        Admin Dashboard
                    </NavLink>
                </nav>

                <div className="text-xs text-muted-foreground px-2 py-4 border-t">
                    v1.0.0
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
