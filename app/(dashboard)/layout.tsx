"use client"

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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Package, LogOut, User, Users, FolderArchiveIcon, FolderCheck } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = "aldren@example.com"

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* SIDEBAR */}
        <Sidebar className="bg-[#2C2C2C] text-white">
          <SidebarHeader className="flex flex-col gap-2 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" className="h-8 w-8" />
              <span className="text-xl font-bold">Duckil</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-4 w-4" />
              {currentUser}
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

                <SidebarMenuItem>
                  <Link href="/validation">
                    <SidebarMenuButton className="hover:bg-blue-800 rounded-md text-white">
                      <FolderArchiveIcon className="mr-2 h-4 w-4" />
                      Validation
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/validation">
                    <SidebarMenuButton className="hover:bg-blue-800 rounded-md text-white">
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-700 p-4">
            <Button variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* 🔥 THIS IS THE KEY PART */}
        <main className="flex-1 bg-gray-100 p-6 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
