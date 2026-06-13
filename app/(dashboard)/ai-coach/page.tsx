"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { getCarbonTwinProfile } from "@/services/firebase/firestore";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import type { ChatMessage } from "@/types";
import { nanoid } from "@/utils/nanoid";
import { cn } from "@/utils";

const STARTER_PROMPTS = [
  "What's my biggest source of emissions?",
  "How can I reduce my transport footprint?",
  "Create a 30-day sustainability plan for me",
  "How does my footprint compare to the global average?",
];

export default function AiCoachPage() {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["carbonTwinProfile", user?.uid],
    queryFn: () => getCarbonTwinProfile(user!.uid),
    enabled: !!user?.uid,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming || !profile) return;

    const userMsg: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Add placeholder assistant message
    const assistantId = nanoid();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const footprint = calculateCarbonFootprint(profile);
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          profile,
          footprint,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const currentContent = accumulated + chunk;
        accumulated = currentContent;

        // Update the last message with accumulated content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: currentContent } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Sorry, I encountered an error. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-6 h-6 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold">AI Sustainability Coach</h1>
        </div>
        <p className="text-muted-foreground">
          Your personal Gemini-powered assistant with full Carbon Twin context
        </p>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto glass rounded-2xl p-6 space-y-6 mb-4"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full gradient-brand-subtle flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Hi {user?.displayName?.split(" ")[0]}! 👋
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              I&apos;m your AI Sustainability Coach. I have full access to your Carbon 
              Twin profile and can help you reduce your footprint.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md" role="list" aria-label="Starter prompts">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                  role="listitem"
                  aria-label={`Start with: ${prompt}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                  role="article"
                  aria-label={msg.role === "user" ? "Your message" : "AI Coach response"}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      msg.role === "user"
                        ? "bg-primary/20"
                        : "gradient-brand-subtle border border-primary/20"
                    )}
                    aria-hidden="true"
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-primary" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    {msg.content || (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={profile ? "Ask me anything about your carbon footprint..." : "Loading your profile..."}
            disabled={!profile || isStreaming}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50 min-h-[36px] max-h-32"
            style={{ height: "auto" }}
            aria-label="Message input"
            aria-describedby="chat-hint"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming || !profile}
            className={cn(
              "p-2.5 rounded-xl gradient-brand text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:shadow-lg hover:shadow-primary/20 transition-all"
            )}
            aria-label="Send message"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <p id="chat-hint" className="text-xs text-muted-foreground mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
