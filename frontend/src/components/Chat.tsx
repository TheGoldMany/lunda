import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { Message } from "../api/types";
import { useAuth } from "../auth/AuthContext";

export function Chat({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    setMessages(await api.get<Message[]>(`/bookings/${bookingId}/messages`));
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/bookings/${bookingId}/messages`, { text });
      setText("");
      await refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-messages" ref={listRef}>
        {messages?.length === 0 && <p className="muted">Még nincs üzenet.</p>}
        {messages?.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.senderId === user?.id ? "mine" : ""}`}>
            <span className="chat-sender">{m.sender.name}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="chat-input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Üzenet..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          Küldés
        </button>
      </form>
    </div>
  );
}
