"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fileToBase64 } from "@/utilities/file-utils";

export default function ReceiptsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // TanStack Query — fetch all receipts
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["receipts"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/receipts`).then((res) =>
        res.json(),
      ),
  });

  const handleFileExtract = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/receipts/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: file.type,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      await queryClient.invalidateQueries({ queryKey: ["receipts"] });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Receipts</h1>

      {/* Upload section */}
      <div className="mb-8">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          className="mt-4"
          onClick={handleFileExtract}
          disabled={!file || loading}
        >
          {loading ? "Extracting..." : "Extract Receipt"}
        </Button>
      </div>

      {/* Receipts list */}
      {isLoading && <p>Loading receipts...</p>}
      {isError && <p>Error loading receipts</p>}
      {data?.data?.map((receipt: any) => (
        <div key={receipt._id} className="p-4 border rounded-md mb-3">
          <p className="font-bold">{receipt.merchant}</p>
          <p className="text-sm text-muted-foreground">{receipt.date}</p>
          <p className="text-sm">Total: ₹{receipt.total}</p>
          <p className="text-sm">Category: {receipt.category}</p>
        </div>
      ))}
    </div>
  );
}
