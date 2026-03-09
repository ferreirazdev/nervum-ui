import { Outlet } from 'react-router';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';

/**
 * Layout for the environment map page. Provides the main app sidebar (collapsed by default)
 * so the top-left trigger in MapPage can open it without navigating away.
 */
export function MapLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
