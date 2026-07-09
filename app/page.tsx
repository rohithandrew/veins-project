"use client";

import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import type { ViewKey } from "@/lib/types";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ToastContainer } from "@/components/Toasts";
import { Dashboard } from "@/components/Dashboard";
import { POUpload } from "@/components/POUpload";
import { Production } from "@/components/Production";
import { Inventory } from "@/components/Inventory";
import { SupplierDashboard } from "@/components/SupplierDashboard";
import { AssistantPage } from "@/components/AssistantPage";
import { LowStockPage } from "@/components/LowStockPage";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { GlobalLowStockBar } from "@/components/GlobalLowStockBar";
import { SupplyRequestModal } from "@/components/SupplyRequestModal";

function AppShell() {
  const [view, setView] = useState<ViewKey>("assistant");
  const { customPages, unlockedPages, pendingNavigation, dispatch } = useStore();

  useEffect(() => {
    if (view === "low-stock" && !customPages.includes("low-stock")) {
      setView("assistant");
      return;
    }
    const corePages: ViewKey[] = ["dashboard", "po-upload", "production", "inventory", "supplier"];
    if (corePages.includes(view) && !unlockedPages.includes(view as (typeof unlockedPages)[number])) {
      setView("assistant");
    }
  }, [view, customPages, unlockedPages]);

  useEffect(() => {
    if (pendingNavigation) {
      setView(pendingNavigation);
      dispatch({ type: "CLEAR_PENDING_NAVIGATION" });
    }
  }, [pendingNavigation, dispatch]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-paper)] paper-grain">
      <Sidebar current={view} onNavigate={setView} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar current={view} />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <GlobalLowStockBar />
          {view === "dashboard" && unlockedPages.includes("dashboard") && <Dashboard onNavigate={setView} />}
          {view === "po-upload" && unlockedPages.includes("po-upload") && <POUpload />}
          {view === "production" && unlockedPages.includes("production") && <Production />}
          {view === "inventory" && unlockedPages.includes("inventory") && <Inventory />}
          {view === "supplier" && unlockedPages.includes("supplier") && <SupplierDashboard />}
          {view === "assistant" && <AssistantPage />}
          {view === "low-stock" && customPages.includes("low-stock") && <LowStockPage onNavigate={setView} />}
        </main>
      </div>
      <ToastContainer />
      <SupplyRequestModal />
      <FloatingAssistant hidden={view === "assistant"} page={view} />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
