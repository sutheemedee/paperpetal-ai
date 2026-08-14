import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Home from "./pages/Home.tsx";
import Knowledge from "./pages/Knowledge.tsx";
import Chat from "./pages/Chat.tsx";
import Present from "./pages/Present.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Projects from "./pages/Projects.tsx";
import Pricing from "./pages/Pricing.tsx";
import Billing from "./pages/Billing.tsx";
import Admin from "./pages/Admin.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import VerifyEmail from "./pages/auth/VerifyEmail.tsx";
import NotFound from "./pages/NotFound.tsx";
import { KnowledgeProvider } from "@/knowledge/store";
import { AuthProvider } from "@/auth/AuthProvider";
import { EntitlementsProvider } from "@/auth/useEntitlements";
import ProtectedRoute from "@/components/account/ProtectedRoute";

const queryClient = new QueryClient();

const guarded = (element: React.ReactNode, adminOnly?: boolean) => (
  <ProtectedRoute adminOnly={adminOnly}>{element}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EntitlementsProvider>
            <KnowledgeProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />

                <Route path="/auth/sign-in" element={<SignIn />} />
                <Route path="/auth/sign-up" element={<SignUp />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/auth/verify-email" element={<VerifyEmail />} />

                <Route path="/onboarding" element={guarded(<Onboarding />)} />
                <Route path="/dashboard" element={guarded(<Dashboard />)} />
                <Route path="/projects" element={guarded(<Projects />)} />
                <Route path="/billing" element={guarded(<Billing />)} />
                <Route path="/knowledge" element={guarded(<Knowledge />)} />
                <Route path="/chat" element={guarded(<Chat />)} />
                <Route path="/present" element={guarded(<Present />)} />
                <Route path="/book" element={guarded(<Index />)} />
                <Route path="/admin" element={guarded(<Admin />, true)} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </KnowledgeProvider>
          </EntitlementsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
