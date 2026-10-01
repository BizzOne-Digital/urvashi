"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export function AdminShell({ title, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-chrome-light/10">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 lg:pl-64">
        <AdminHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 overflow-x-clip p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
