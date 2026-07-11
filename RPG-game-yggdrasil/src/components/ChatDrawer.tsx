import React, { useState, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { db, collection, query, orderBy, limit, onSnapshot, getDocs } from "../lib/firebase";
import { ChatMessage } from "../types";
import { io, Socket } from "socket.io-client";

interface ChatDrawerProps {
  currentUser: { uid: string; displayName: string };
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ currentUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on("chat-broadcast", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((p) => p.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    console.log("Loading history...");

    try {
      const q = query(collection(db, "global_chat"), orderBy("timestamp", "asc"), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("Docs:", snapshot.docs.length);

          const msgs: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            console.log(doc.data());
            msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
          });
          if (msgs.length > 0) {
            setMessages(msgs);
          }
        },
        (err) => {
          console.log("Firestore chat offline/unconfigured, using socket chat state", err);
        },
      );
      return () => unsubscribe();
    } catch (e) {
      console.log("Chat listener error", e);
    }
  }, [isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const msgText = text.trim();
    setText("");

    const newMsg: ChatMessage = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderName: currentUser.displayName,
      senderUid: currentUser.uid,
      text: msgText,
      timestamp: new Date(),
    };

    socket?.emit("chat-message", newMsg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100">Realm Chat</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">No messages yet. Say hello to fellow adventurers!</div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.senderUid === currentUser.uid;
            return (
              <div key={m.id || idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-slate-500 mb-0.5">{m.senderName}</span>
                <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words ${isMe ? "bg-purple-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"}`}>{m.text}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
        />
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl font-semibold transition-colors cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
