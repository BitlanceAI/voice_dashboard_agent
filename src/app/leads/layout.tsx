import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import AdminGuard from "@/components/AdminGuard";

export const metadata: Metadata = {
  title: "Bitlance Leads",
  description: "Manage incoming leads and opportunities",
};

export default function LeadsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <AdminGuard>
          {children}
        </AdminGuard>
      </div>
    </div>
  );
}
