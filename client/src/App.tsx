import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminLayout from "@/components/AdminLayout";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import PropertiesPage from "@/pages/properties";
import PropertyDetailsPage from "@/pages/property-details";
import AgentsPage from "@/pages/agents";
import ContactPage from "@/pages/contact";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import PropertiesManage from "@/pages/admin/properties-manage";
import AgentsManage from "@/pages/admin/agents-manage";
import InquiriesManage from "@/pages/admin/inquiries-manage";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/properties" component={PropertiesPage} />
      <Route path="/properties/:id" component={PropertyDetailsPage} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/properties" component={PropertiesManage} />
        <Route path="/admin/agents" component={AgentsManage} />
        <Route path="/admin/inquiries" component={InquiriesManage} />
        <Route>{() => <AdminDashboard />}</Route>
      </Switch>
    </AdminLayout>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminLogin = location === "/admin/login";
  const isAdmin = location.startsWith("/admin") && !isAdminLogin;

  if (isAdminLogin) {
    return <AdminLogin />;
  }

  if (isAdmin) {
    return <AdminRouter />;
  }

  return (
    <>
      <Navbar />
      <PublicRouter />
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
