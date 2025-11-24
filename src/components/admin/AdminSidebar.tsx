import { NavLink, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Users, LayoutDashboard, Database, Store, Settings, FileSpreadsheet, CheckSquare, CreditCard, BarChart3, FileText, Mail, Archive } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Import/Export", url: "/admin/import", icon: FileSpreadsheet },
  { title: "Inventory", url: "/admin/inventory", icon: Archive },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Order Approvals", url: "/admin/approvals", icon: CheckSquare },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Subscribers", url: "/admin/subscribers", icon: Mail },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Vendors", url: "/admin/vendors", icon: Store },
  { title: "Payment Settings", url: "/admin/payment", icon: CreditCard },
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Data Migration", url: "/admin/migrate", icon: Database },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getNavCls = (active: boolean) =>
    active ? "bg-primary text-primary-foreground" : "hover:bg-muted";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) => getNavCls(isActive)}
                    >
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
