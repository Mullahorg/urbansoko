import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

import Header from "./components/Layout/Header";
import { Footer } from "./components/Layout/Footer";
import InstallPrompt from "./components/PWA/InstallPrompt";
import ErrorBoundary from "./components/ErrorBoundary";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

import RoleRoute from "./components/RoleRoute";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderApproval from "./pages/admin/AdminOrderApproval";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminContent from "./pages/admin/AdminContent";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminProductImport from "./pages/admin/AdminProductImport";
import AdminDataMigration from "./pages/admin/AdminDataMigration";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";

// User Pages
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";

// Public Pages
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import RewardsPage from "./pages/RewardsPage";
import VendorRegistrationPage from "./pages/VendorRegistrationPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { getTotalItems } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Header cartCount={getTotalItems()} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Public Pages */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/vendor-registration" element={<VendorRegistrationPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RoleRoute requiredRole="admin"><AdminLayout /></RoleRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="approvals" element={<AdminOrderApproval />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="payment" element={<AdminPaymentSettings />} />
            <Route path="import" element={<AdminProductImport />} />
            <Route path="migrate" element={<AdminDataMigration />} />
          </Route>

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<RoleRoute requiredRole="vendor"><VendorDashboard /></RoleRoute>} />
          <Route path="/vendor/products" element={<RoleRoute requiredRole="vendor"><VendorProducts /></RoleRoute>} />

          {/* User Routes */}
          <Route path="/profile" element={<RoleRoute requiredRole="user"><ProfilePage /></RoleRoute>} />
          <Route path="/orders" element={<RoleRoute requiredRole="user"><OrdersPage /></RoleRoute>} />
          <Route path="/wishlist" element={<RoleRoute requiredRole="user"><WishlistPage /></RoleRoute>} />

          {/* Catch-all */}
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
