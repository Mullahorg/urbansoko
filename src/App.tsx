import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductImport from "./pages/admin/AdminProductImport";
import AdminOrderApproval from "./pages/admin/AdminOrderApproval";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminContent from "./pages/admin/AdminContent";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDataMigration from "./pages/admin/AdminDataMigration";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminSettings from "./pages/admin/AdminSettings";
import WishlistPage from "./pages/WishlistPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import RewardsPage from "./pages/RewardsPage";
import VendorRegistrationPage from "./pages/VendorRegistrationPage";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import FAQPage from "./pages/FAQPage";
import ShippingPage from "./pages/ShippingPage";
import Header from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import InstallPrompt from "./components/PWA/InstallPrompt";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider, useCart } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { getTotalItems } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Header cartCount={getTotalItems()} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/category/:category/:subcategory" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="import" element={<AdminProductImport />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="approvals" element={<AdminOrderApproval />} />
            <Route path="payment" element={<AdminPaymentSettings />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="migrate" element={<AdminDataMigration />} />
          </Route>
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          <Route path="/vendor/register" element={<ProtectedRoute><VendorRegistrationPage /></ProtectedRoute>} />
          <Route path="/vendor/dashboard" element={<ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/products" element={<ProtectedRoute requiredRole="vendor"><VendorProducts /></ProtectedRoute>} />
          
          {/* Info Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
