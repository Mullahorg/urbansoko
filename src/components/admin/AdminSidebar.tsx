import { NavLink, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Users, LayoutDashboard, Database, Store, Settings, FileSpreadsheet, CheckSquare, CreditCard, BarChart3, FileText, Mail, Archive, Layers, Globe, Sparkles } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: Layers },
  { title: "Import/Export", url: "/admin/import", icon: FileSpreadsheet },
  { title: "Inventory", url: "/admin/inventory", icon: Archive },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Order Approvals", url: "/admin/approvals", icon: CheckSquare },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Gamification", url: "/admin/gamification", icon: Sparkles },
  { title: "Subscribers", url: "/admin/subscribers", icon: Mail },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Vendors", url: "/admin/vendors", icon: Store },
  { title: "Languages", url: "/admin/languages", icon: Globe },
  { title: "Payment Settings", url: "/admin/payment", icon: CreditCard },
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Data Migration", url: "/admin/migrate", icon: Database },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useUserRole();

  if (!isAdmin) return null;

  const isActive = (path: string, end?: boolean) => end ? location.pathname === path : location.pathname.startsWith(path);
  const getNavCls = (active: boolean) => active ? "bg-primary text-primary-foreground" : "hover:bg-muted";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.end} className={({ isActive }) => getNavCls(isActive)}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
