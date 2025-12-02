import { NavLink, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Users, LayoutDashboard, Database, Store, Settings, FileSpreadsheet, CheckSquare, CreditCard, BarChart3, FileText, Mail, Archive, Layers, Globe, Sparkles, HardDrive } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader } from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const adminGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3, badge: "New" },
    ]
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/admin/products", icon: Package },
      { title: "Categories", url: "/admin/categories", icon: Layers },
      { title: "Import/Export", url: "/admin/import", icon: FileSpreadsheet },
      { title: "Inventory", url: "/admin/inventory", icon: Archive },
    ]
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "Order Approvals", url: "/admin/approvals", icon: CheckSquare },
    ]
  },
  {
    label: "Content & Engagement",
    items: [
      { title: "Content", url: "/admin/content", icon: FileText },
      { title: "Gamification", url: "/admin/gamification", icon: Sparkles },
      { title: "Subscribers", url: "/admin/subscribers", icon: Mail },
    ]
  },
  {
    label: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Vendors", url: "/admin/vendors", icon: Store },
      { title: "Languages", url: "/admin/languages", icon: Globe },
    ]
  },
  {
    label: "Configuration",
    items: [
      { title: "Payment Settings", url: "/admin/payment", icon: CreditCard },
      { title: "Settings", url: "/admin/settings", icon: Settings },
      { title: "Database Export", url: "/admin/database", icon: HardDrive },
      { title: "Data Migration", url: "/admin/migrate", icon: Database },
    ]
  }
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useUserRole();

  if (!isAdmin) return null;

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarHeader className="border-b p-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          {open && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sm">Admin Panel</span>
              <span className="text-xs text-muted-foreground">Management Console</span>
            </motion.div>
          )}
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        {adminGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            {open && (
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const isActive = item.end 
                    ? location.pathname === item.url 
                    : location.pathname.startsWith(item.url);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.end}
                          className={`
                            relative group transition-all duration-200
                            ${isActive 
                              ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90' 
                              : 'hover:bg-muted/80 text-sidebar-foreground'
                            }
                            rounded-lg
                          `}
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: (groupIndex * 0.1) + (itemIndex * 0.05) }}
                            className="flex items-center gap-3 w-full"
                          >
                            <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-foreground' : ''}`} />
                            {open && (
                              <span className="flex-1 font-medium text-sm">{item.title}</span>
                            )}
                            {open && item.badge && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                {item.badge}
                              </Badge>
                            )}
                          </motion.div>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
