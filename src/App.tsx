import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth, ExtendedUser } from "./contexts/AuthContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

import Header from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import InstallPrompt from "./components/PWA/InstallPrompt";
import ErrorBoundary from "./components/ErrorBoundary";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
// ... import other pages

const queryClient = new QueryClient();

// RoleRoute wrapper
const RoleRoute = ({ children, requiredRole }: { children: JSX.Element; requiredRole?: "admin" | "vendor" | "user" }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // optionally a loader
  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
};

const AppContent = () => {
  const { getTotalItems } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Header cartCount={getTotalItems()} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RoleRoute requiredRole="admin"><AdminLayout /></RoleRoute>}>
            <Route index element={<AdminDashboard />} />
            {/* other admin nested routes */}
          </Route>

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<RoleRoute requiredRole="vendor"><div>Vendor Dashboard</div></RoleRoute>} />

          {/* Protected User Routes */}
          <Route path="/profile" element={<RoleRoute requiredRole="user"><div>Profile Page</div></RoleRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
