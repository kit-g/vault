import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "../components/AppHeader.tsx";
import { Sidebar } from "../components/Sidebar.tsx";

export function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <AppHeader onMenuClick={ () => setSidebarOpen(true) }/>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden lg:flex"/>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet/>
        </main>
      </div>
      <Sidebar
        isDrawer={ true }
        isOpen={ isSidebarOpen }
        onClose={ () => setSidebarOpen(false) }
        className="lg:hidden"
      />
    </div>
  );
}