"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setTutorOpen } from "@/features/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string };

export function TutorDrawer({ lessonId }: { lessonId: string }) {
  const open = useAppSelector((s) => s.ui.tutorOpen);
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        dispatch(setTutorOpen(true));
      }
      if (e.key === "Escape") dispatch(setTutorOpen(false));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  async function send() {
    if (!input.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data } = await api.post<{ answer: string }>("/ai/tutor", {
        lessonId,
        message: input.trim(),
        history: messages,
      });
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch {
      toast.error("Tutor unavailable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close tutor"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setTutorOpen(false))}
          />
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Learnora Tutor
              </div>
              <Button variant="ghost" size="icon" onClick={() => dispatch(setTutorOpen(false))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
              {messages.length === 0 && (
                <p className="text-[14px] text-[var(--muted)]">
                  Ask about this lesson. Press <kbd className="rounded bg-[var(--surface-2)] px-1.5">A</kbd> anytime.
                  Answers stay grounded in ingested content — no quiz spoilers.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 text-[14px] ${
                    m.role === "user"
                      ? "ml-8 bg-[var(--accent)] text-white"
                      : "mr-8 bg-[var(--surface-2)] text-[var(--text)]"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-[var(--border)] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the tutor…"
                disabled={busy}
              />
              <Button type="submit" size="icon" disabled={busy}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
