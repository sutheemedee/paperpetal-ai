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
import NotFound from "./pages/NotFound.tsx";
import { KnowledgeProvider } from "@/knowledge/store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <KnowledgeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/present" element={<Present />} />
            <Route path="/book" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </KnowledgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
