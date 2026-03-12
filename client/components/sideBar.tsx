"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen border-r p-6 flex-col gap-2">
        <h1 className="text-xl font-bold mb-6">ReceiptIQ</h1>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground",
            )}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around p-3 z-50">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 text-xs",
              pathname === link.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <link.icon size={20} />
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
