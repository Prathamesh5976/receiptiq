import Sidebar from "@/components/sideBar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 pb-20 lg:pb-4 min-w-0">{children}</main>
    </div>
  );
}
