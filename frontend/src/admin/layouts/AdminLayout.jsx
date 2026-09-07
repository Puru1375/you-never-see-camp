import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Tags,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
    ShieldCheck,
    RefreshCcw,
    ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { adminLogout } from "../services/admin";

const AdminLayout = () => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const adminUser = JSON.parse(
    localStorage.getItem("admin_user") || "null"
  );

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login", {
      replace: true,
    });
  };

  const navigation = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Bookings",
      path: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      name: "Packages",
      path: "/admin/packages",
      icon: Package,
    },
    {
      name: "Pricing",
      path: "/admin/pricing",
      icon: Tags,
    },
    {
      name: "Taxes",
      path: "/admin/tax",
      icon: Receipt,
    },
    {
  name: "Cancellation",
  path: "/admin/cancellation-policies",
  icon: ShieldCheck,
},
{
  name: "Refunds",
  path: "/admin/refunds",
  icon: RefreshCcw,
},
{
  name: "Gallery",
  path: "/admin/gallery",
  icon: ImageIcon,
},
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <div className="flex items-center gap-3">

          <img
            src="/logo.png"
            alt="You Never See Camp"
            className="h-10 w-10 rounded-lg object-contain"
          />

          <div>
            <p className="text-sm font-bold text-slate-900">
              You Never See Camp
            </p>

            <p className="text-xs text-slate-500">
              Admin Panel
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </header>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden">
          <div className="absolute left-0 top-16 w-72 bg-white shadow-xl">

            <AdminNavigation
              navigation={navigation}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />

          </div>
        </div>
      )}

      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white lg:block">

          <div className="sticky top-0 flex h-screen flex-col">

            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">

              <img
                src="/logo.png"
                alt="You Never See Camp"
                className="h-11 w-11 rounded-lg object-contain"
              />

              <div>
                <p className="text-sm font-bold text-slate-900">
                  You Never See Camp
                </p>

                <p className="text-xs text-slate-500">
                  Admin Panel
                </p>
              </div>

            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">

              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Management
              </p>

              <AdminNavigation
                navigation={navigation}
                onNavigate={() => {}}
                onLogout={handleLogout}
              />

            </div>

            {/* User */}
            <div className="border-t border-slate-200 p-4">

              <div className="mb-3 rounded-xl bg-slate-50 p-3">

                <p className="truncate text-sm font-semibold text-slate-900">
                  {adminUser?.name || "Admin"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {adminUser?.email || ""}
                </p>

              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </div>

        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">

          {/* Desktop Topbar */}
          <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">

            <div>
              <p className="text-sm text-slate-500">
                Admin Panel
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {adminUser?.name || "Admin"}
                </p>

                <p className="text-xs text-slate-500">
                  {adminUser?.role || "admin"}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-950 text-sm font-bold text-white">
                {(adminUser?.name || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>

            </div>

          </header>

          {/* Page */}
          <main>
            <Outlet />
          </main>

        </div>

      </div>

    </div>
  );
};

const AdminNavigation = ({
  navigation,
  onNavigate,
}) => {
  return (
    <nav className="space-y-1">

      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-forest-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            <Icon size={19} />
            {item.name}
          </NavLink>
        );
      })}

    </nav>
  );
};

export default AdminLayout;