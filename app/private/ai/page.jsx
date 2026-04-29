"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Send,
  Bot,
  User,
  LoaderCircle,
  Sparkles,
  Clock,
  AlertTriangle,
  ArrowDown,
  Trash2,
  Package,
  Archive,
  History,
  Search,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ai_chat_history");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0)
      sessionStorage.setItem("ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!rateLimit) return;
    const t = setInterval(() => {
      setRateLimit((p) =>
        !p || p.remaining <= 1 ? null : { ...p, remaining: p.remaining - 1 }
      );
    }, 1000);
    return () => clearInterval(t);
  }, [rateLimit]);

  const scrollToBottom = useCallback((b = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior: b });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const c = chatContainerRef.current;
    if (!c) return;
    const h = () =>
      setShowScrollBtn(c.scrollHeight - c.scrollTop - c.clientHeight > 100);
    c.addEventListener("scroll", h);
    return () => c.removeEventListener("scroll", h);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || rateLimit) return;

    const userMsg = { role: "user", content: trimmed, timestamp: Date.now() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const historyForApi = messages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyForApi }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setRateLimit({ message: data.error, remaining: data.retryAfter || 60 });
        setMessages((p) => [
          ...p,
          {
            role: "assistant",
            content: data.error,
            timestamp: Date.now(),
            isError: true,
            errorType: "rate_limit",
          },
        ]);
      } else if (!res.ok) {
        setMessages((p) => [
          ...p,
          {
            role: "assistant",
            content: data.error || "Something went wrong.",
            timestamp: Date.now(),
            isError: true,
          },
        ]);
      } else {
        setMessages((p) => [
          ...p,
          {
            role: "assistant",
            content: data.response,
            intent: data.intent,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: "Network error. Check your connection.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem("ai_chat_history");
  };

  const handleSuggestion = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-3xl mx-auto bg-white relative">
      {/* Header */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-10 safe-top">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  SIC AI
                </h1>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                  Inventory Assistant
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {rateLimit && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                <Clock size={11} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 tabular-nums">
                  {rateLimit.remaining}s
                </span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-3 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-1" />
          </>
        )}
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-[88px] right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-lg text-slate-500 active:scale-95"
          >
            <ArrowDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0  border-t border-slate-100 bg-white/95 backdrop-blur-md px-3 pt-2 safe-bottom">
        {rateLimit && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              Rate limit. Wait{" "}
              <span className="font-bold tabular-nums">
                {rateLimit.remaining}s
              </span>
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-end justify-between w-full gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                rateLimit ? "Waiting..." : "Ask about stock, bins, MID..."
              }
              disabled={!!rateLimit || isLoading}
              rows={1}
              className="w-full min-h-[44px] max-h-[100px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 focus:bg-white resize-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !!rateLimit}
            className="h-[44px] w-[44px] mb-1.5 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-indigo-200/50 disabled:opacity-30 disabled:shadow-none"
          >
            {isLoading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-1 mb-2">
          Gemini Free · ~15 req/min
        </p>
      </div>
    </div>
  );
}

/* ─── Welcome ─── */
function WelcomeScreen({ onSuggestion }) {
  const suggestions = [
    {
      icon: <Package size={15} />,
      label: "Stock",
      text: "stock 12345",
      desc: "Cek stok by MID",
    },
    {
      icon: <Archive size={15} />,
      label: "Empty Bin",
      text: "empty AA",
      desc: "Cari bin kosong",
    },
    {
      icon: <History size={15} />,
      label: "Old MID",
      text: "30000123",
      desc: "Cek MID lama/baru",
    },
    {
      icon: <Search size={15} />,
      label: "Cari",
      text: "bearing",
      desc: "Cari by deskripsi",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-200/60">
          <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-0.5">
          SIC AI Assistant
        </h2>
        <p className="text-xs text-slate-500 max-w-[260px] mx-auto leading-relaxed">
          Tanya soal stock, bin, atau material ID.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            onClick={() => onSuggestion(s.text)}
            className="group flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 transition-all active:scale-[0.97] text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-colors shrink-0">
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {s.label}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 max-w-xs w-full"
      >
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          <span className="font-bold text-slate-600">Tips:</span>{" "}
          <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-500 font-bold">
            stock
          </code>{" "}
          + MID ·{" "}
          <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-500 font-bold">
            empty
          </code>{" "}
          + bin
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600"
            : message.isError
              ? "bg-red-100"
              : "bg-gradient-to-br from-emerald-400 to-teal-500"
        }`}
      >
        {isUser ? (
          <User size={13} className="text-white" />
        ) : message.isError ? (
          <AlertTriangle size={13} className="text-red-500" />
        ) : (
          <Bot size={13} className="text-white" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-md"
            : message.isError
              ? "bg-red-50 border border-red-100 text-red-700 rounded-tl-md"
              : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-md"
        }`}
      >
        {isUser ? (
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="text-[13px] leading-relaxed">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
        <p
          className={`text-[9px] mt-1.5 ${isUser ? "text-indigo-200" : "text-slate-400"}`}
        >
          {new Date(message.timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.intent && (
            <span className="ml-1 uppercase font-bold">· {message.intent}</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Markdown Renderer ─── */
function MarkdownRenderer({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  const elements = [];
  let inTable = false,
    tableHeaders = [],
    tableRows = [];
  let inCode = false,
    codeLines = [];
  let listItems = [],
    listType = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <Tag
        key={`l${elements.length}`}
        className={`my-1.5 space-y-0.5 ${listType === "ol" ? "list-decimal" : "list-disc"} pl-4`}
      >
        {listItems.map((it, j) => (
          <li key={j} className="text-[13px]">
            <Inline text={it} />
          </li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  const flushTable = () => {
    if (!tableHeaders.length) return;
    elements.push(
      <div
        key={`t${elements.length}`}
        className="my-2 overflow-x-auto rounded-lg border border-slate-200 -mx-1"
      >
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              {tableHeaders.map((h, j) => (
                <th
                  key={j}
                  className="px-2.5 py-1.5 text-left font-bold text-slate-600 border-b border-slate-200 whitespace-nowrap"
                >
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, j) => (
              <tr key={j} className={j % 2 ? "bg-slate-50/50" : ""}>
                {row.map((cell, k) => (
                  <td
                    key={k}
                    className="px-2.5 py-1.5 text-slate-700 border-b border-slate-100 whitespace-nowrap"
                  >
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        elements.push(
          <pre
            key={`c${elements.length}`}
            className="my-1.5 p-2.5 rounded-lg bg-slate-800 text-slate-100 text-xs overflow-x-auto -mx-1"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      if (!inTable) {
        flushList();
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4
          key={`h${elements.length}`}
          className="font-bold text-[13px] text-slate-800 mt-2.5 mb-0.5"
        >
          {line.slice(4)}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3
          key={`h${elements.length}`}
          className="font-bold text-sm text-slate-900 mt-2.5 mb-0.5"
        >
          {line.slice(3)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h2
          key={`h${elements.length}`}
          className="font-bold text-sm text-slate-900 mt-2.5 mb-0.5"
        >
          {line.slice(2)}
        </h2>
      );
      continue;
    }

    if (/^[\s]*[-*•]\s/.test(line)) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(line.replace(/^[\s]*[-*•]\s/, ""));
      continue;
    }
    if (/^[\s]*\d+[.)]\s/.test(line)) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(line.replace(/^[\s]*\d+[.)]\s/, ""));
      continue;
    }

    flushList();
    if (!line.trim()) {
      elements.push(<div key={`b${elements.length}`} className="h-1.5" />);
      continue;
    }
    elements.push(
      <p key={`p${elements.length}`} className="text-[13px] leading-relaxed">
        <Inline text={line} />
      </p>
    );
  }
  flushList();
  flushTable();
  return <>{elements}</>;
}

/* ─── Inline markdown ─── */
function Inline({ text }) {
  const parts = [];
  let rest = text,
    k = 0;
  while (rest.length > 0) {
    const b = rest.match(/\*\*(.+?)\*\*/);
    const c = rest.match(/`([^`]+)`/);
    let m = null,
      t = null;
    if (b && (!c || b.index <= c.index)) {
      m = b;
      t = "b";
    } else if (c) {
      m = c;
      t = "c";
    }
    if (!m) {
      parts.push(<span key={k++}>{rest}</span>);
      break;
    }
    if (m.index > 0)
      parts.push(<span key={k++}>{rest.slice(0, m.index)}</span>);
    if (t === "b")
      parts.push(
        <strong key={k++} className="font-bold text-slate-900">
          {m[1]}
        </strong>
      );
    else
      parts.push(
        <code
          key={k++}
          className="px-1 py-0.5 rounded bg-slate-200/60 text-indigo-600 font-mono text-xs font-bold"
        >
          {m[1]}
        </code>
      );
    rest = rest.slice(m.index + m[0].length);
  }
  return <>{parts}</>;
}

/* ─── Typing indicator ─── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2"
    >
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mt-0.5">
        <Bot size={13} className="text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-slate-300"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">Searching...</span>
        </div>
      </div>
    </motion.div>
  );
}
