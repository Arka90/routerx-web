import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Globe, 
  Settings, 
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Status Pages", href: "/status-pages", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useLogout();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-black dark:bg-white text-white dark:text-black flex flex-col items-center justify-center font-bold text-xs uppercase cursor-default">
            RX
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            RouteRX
          </span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col justify-between px-4 pb-6 pt-4 overflow-y-auto">
        <nav className="flex flex-col gap-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-neutral-100 text-neutral-900 border-l-2 border-black dark:bg-neutral-900 dark:text-white dark:border-white"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white border-l-2 border-transparent"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    isActive ? "text-black dark:text-white" : "text-neutral-400 group-hover:text-black dark:group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 flex flex-col gap-1">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            Account
          </div>
          <button
            onClick={() => logout()}
            className="group flex w-full items-center gap-3 rounded-none px-3 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-neutral-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-red-500 border-l-2 border-transparent"
          >
            <LogOut className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
