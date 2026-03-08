import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">ReceiptIQ</h1>
      <p className="text-gray-500 mb-8">AI-powered expense tracking</p>
      <Link href="/dashboard">
        <Button>Get Started</Button>
      </Link>
    </main>
  );
}
