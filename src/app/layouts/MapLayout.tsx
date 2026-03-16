import { Outlet } from 'react-router';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';

/**
 * Layout for the environment map page. Provides the main app sidebar (expanded by default).
 */
export function MapLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
