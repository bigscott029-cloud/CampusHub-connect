import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden h-14 border-b border-border/50 flex items-center px-4 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
            <SidebarTrigger>
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-2 ml-3">
              <img src="/CampusHub-logo.png" alt="CampusHub" className="h-8 w-auto max-w-[135px] object-contain" />
            </div>
          </header>
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
