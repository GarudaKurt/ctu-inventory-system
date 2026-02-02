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
import { Folder, LogOut, User, Users } from "lucide-react"
import Reports from "../reports/page"

const Inventory = () => {
  const currentUser = "aldren@example.com"

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar className="bg-[#2C2C2C] text-white">
          <SidebarHeader className="flex flex-col gap-2 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <img
                src="/img/bg.png"
                alt="Duckil Logo"
                className="h-8 w-8"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-4 w-4" />
              <span>{currentUser}</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-xl hover:bg-gray-700 rounded-xl">
                      <Folder className="mr-2 h-6 w-6" />
                      Inventory
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-xl hover:bg-gray-700 rounded-xl">
                      <Users className="mr-2 h-6 w-6" />
                      Users
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white p-4">
            <Button variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-gray-50">
          <Reports />
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Inventory
