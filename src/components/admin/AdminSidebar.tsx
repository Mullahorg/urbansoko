import { NavLink, useLocation } from "react-router-dom";
import { 
  Package, ShoppingCart, Users, LayoutDashboard, Database, Store, Settings, 
  FileSpreadsheet, CheckSquare, CreditCard, BarChart3, FileText, Mail, 
  Archive, Layers, Globe, Sparkles, HardDrive, ChevronRight, Crown
} from "lucide-react";
import { 
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, 
  useSidebar, SidebarHeader, SidebarFooter 
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import patternFabric from "@/assets/pattern-fabric.png";

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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header with pattern background */}
      <SidebarHeader 
        className="relative overflow-hidden border-b border-sidebar-border"
        style={{
          backgroundImage: `url(${patternFabric})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70" />
        <motion.div 
          className="relative z-10 flex items-center gap-3 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Crown className="h-5 w-5 text-white" />
          </motion.div>
          {open && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sm text-white">Admin Panel</span>
              <span className="text-xs text-white/70">Management Console</span>
            </motion.div>
          )}
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-3 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
        {adminGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label} className="mb-2">
            {open && (
              <SidebarGroupLabel className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
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
                          className={cn(
                            "relative group transition-all duration-200 rounded-lg overflow-hidden",
                            isActive 
                              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md" 
                              : "hover:bg-sidebar-accent text-sidebar-foreground"
                          )}
                        >
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: (groupIndex * 0.05) + (itemIndex * 0.02) }}
                            className="flex items-center gap-3 w-full py-0.5"
                          >
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                              isActive 
                                ? "bg-white/20" 
                                : "bg-sidebar-accent group-hover:bg-primary/10"
                            )}>
                              <item.icon className={cn(
                                "h-4 w-4 transition-all",
                                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                              )} />
                            </div>
                            {open && (
                              <>
                                <span className="flex-1 font-medium text-sm">{item.title}</span>
                                {item.badge && (
                                  <Badge 
                                    className={cn(
                                      "text-[9px] px-1.5 py-0 h-4 font-semibold",
                                      isActive 
                                        ? "bg-white/20 text-white border-0" 
                                        : "bg-primary/10 text-primary border-primary/20"
                                    )}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                <ChevronRight className={cn(
                                  "h-3 w-3 opacity-0 group-hover:opacity-100 transition-all",
                                  isActive ? "text-primary-foreground opacity-100" : "text-muted-foreground"
                                )} />
                              </>
                            )}
                          </motion.div>
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

      {/* Footer with version info */}
      {open && (
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              Admin Console v1.0
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
