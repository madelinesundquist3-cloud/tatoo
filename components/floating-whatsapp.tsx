"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

const WHATSAPP_NUMBER = "13029241734";
const FORMATTED_PHONE = "+1 (302) 924-1734";

const QUICK_TOPICS = [
  {
    label: "📅 Book an appointment",
    text: "Hi Marked Studio! I would like to inquire about booking a tattoo appointment.",
  },
  {
    label: "🎨 Custom tattoo design & quote",
    text: "Hi Marked Studio! I have a custom tattoo design idea and would love to get a consultation and price estimate.",
  },
  {
    label: "✨ Tattoo removal consultation",
    text: "Hi Marked Studio! I'm interested in booking a tattoo removal / fading consultation.",
  },
  {
    label: "💬 General inquiry",
    text: "Hi Marked Studio! I have a quick question about your artists and locations.",
  },
];

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openWhatsApp = (message?: string) => {
    const textToSend = message || customMsg || "Hi Marked Studio! I would like to inquire about a tattoo consultation.";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <aside
      ref={popoverRef}
      aria-label="WhatsApp customer support chat"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto"
    >
      {/* Popover Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="whatsapp-chat-title"
          className="mb-3.5 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-white/15 bg-[#121215]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#172e22] via-[#10241b] to-[#121215] p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white shadow-md">
                <WhatsAppIcon className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#121215] rounded-full" />
              </div>
              <div>
                <h2 id="whatsapp-chat-title" className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                  Marked Studio Concierge
                  <Sparkles className="w-3.5 h-3.5 text-[#d3b995]" />
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-zinc-300">Online · Instant Reply</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close WhatsApp chat popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 text-xs sm:text-sm">
            {/* Incoming message bubble */}
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-sm p-3.5 text-zinc-200 leading-relaxed">
              <p className="font-medium text-white mb-1">Welcome to Marked Studio! 🖋️</p>
              <p className="text-zinc-300 text-xs sm:text-[13px]">
                Have a question about design ideas, artist availability, pricing, or tattoo removal? Chat with our team directly on WhatsApp.
              </p>
              <p className="mt-2 text-[11px] text-[#d3b995] font-mono">
                {FORMATTED_PHONE}
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
                Quick Inquiries
              </p>
              <div className="space-y-1.5">
                {QUICK_TOPICS.map((topic, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openWhatsApp(topic.text)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-xs text-zinc-200 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{topic.label}</span>
                    <Send className="w-3 h-3 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Message Input */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openWhatsApp(customMsg);
                    }
                  }}
                  placeholder="Type a custom message..."
                  className="flex-1 rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => openWhatsApp(customMsg)}
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#25D366] text-black font-semibold hover:bg-[#20ba59] transition-colors"
                  aria-label="Send WhatsApp message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direct Chat CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Marked Studio! I would like to inquire about a tattoo consultation.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs sm:text-sm font-semibold text-black hover:bg-[#20ba59] transition-all shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)]"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>Open WhatsApp Chat ({FORMATTED_PHONE})</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="relative flex items-center group">
        {/* Tooltip on hover (when popover is closed) */}
        {!isOpen && (
          <div className="hidden sm:flex absolute right-full mr-3 items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#121215]/95 px-3.5 py-1.5 shadow-xl backdrop-blur-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-white">
                Chat on WhatsApp <span className="text-zinc-400">({FORMATTED_PHONE})</span>
              </span>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close WhatsApp support chat" : "Open WhatsApp support chat (+1 302-924-1734)"}
          aria-expanded={isOpen}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isOpen
              ? "bg-zinc-800 border border-white/20 text-white"
              : "bg-[#25D366] hover:bg-[#20ba59]"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform duration-200" />
          ) : (
            <>
              {/* Subtle pulsing background ring */}
              <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping -z-10" />
              <WhatsAppIcon className="w-7 h-7 text-white" />
              {/* Online indicator dot */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#09090b]" />
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
