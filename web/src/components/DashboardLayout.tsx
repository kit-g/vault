import {Outlet} from "react-router-dom";
import {AppHeader} from "./AppHeader.tsx";
import {Sidebar} from "./Sidebar.tsx";

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader/>
      <div className="flex flex-1">
        <Sidebar/>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}