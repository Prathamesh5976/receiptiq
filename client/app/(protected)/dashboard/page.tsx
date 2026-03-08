import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome to your ReceiptIQ dashboard!</p>
      <Link href="/receipts">
        <Button>View Receipts</Button>
      </Link>
    </main>
  );
}
