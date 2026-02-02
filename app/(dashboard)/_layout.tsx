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
import { Package, LogOut, User, Users } from "lucide-react"

const Inventory = () => {
  // Replace with your auth/session user
  const currentUser = "aldren@example.com"

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar className="bg-gray-900 text-white">
          {/* Header with logo + title + user */}
          <SidebarHeader className="flex flex-col gap-2 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Duckil Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">Duckil</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-4 w-4" />
              <span>{currentUser}</span>
            </div>
          </SidebarHeader>

          {/* Content */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Package className="mr-2 h-4 w-4" />
                      Inventory
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer with logout */}
          <SidebarFooter className="border-t border-gray-700 p-4">
            <Button variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 bg-gray-100 p-6">
          <h1 className="text-2xl font-semibold">Inventory Dashboard</h1>
          {/* Your main content goes here */}
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Inventory
