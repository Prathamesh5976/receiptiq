"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Add empty assistant message — we'll fill it as chunks arrive
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        },
      );

      // Read stream chunk by chunk
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and split by SSE format
        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          const parsed = JSON.parse(jsonStr);

          if (parsed.done) break;

          if (parsed.text) {
            // Append chunk to last message
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].content += parsed.text;
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      <h1 className="text-2xl font-bold mb-4">Ask About Your Expenses</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground">
            Ask anything about your receipts...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-md max-w-2xl ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-muted p-3 rounded-md max-w-2xl">Thinking...</div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          placeholder="How much did I spend on food this month?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
