"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  FolderCheck,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* SIDEBAR */}
        <Sidebar className="bg-[#2C2C2C] text-white">
          <SidebarHeader className="flex flex-col gap-2 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <img src="/img/bg.png" className="h-8 w-8" />
              <span className="text-xl font-bold">Duckil</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/reports">
                    <SidebarMenuButton className="hover:bg-blue-800 rounded-md text-white">
                      <FolderCheck className="mr-2 h-4 w-4" />
                      Inventory
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-700 p-4">
            <Link href={"/"}>
              <Button variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 bg-[#F3F3F3] p-6 w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
