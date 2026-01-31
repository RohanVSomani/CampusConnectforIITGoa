import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CarpoolChat({ carpool, onClose }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  async function loadHistory() {
    try {
      const res = await api.get(`/carpool-chat/${carpool._id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Chat history error:', err);
    }
  }

  useEffect(() => {
    loadHistory();

    const token = localStorage.getItem('campusflow_token');
    const s = io(`${BASE}/carpool-chat`, {
      auth: token ? { token } : {},
      transports: ['websocket'],
    });

    s.emit('join', { carpoolId: carpool._id });

    s.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(s);
    return () => s.disconnect();
  }, [carpool._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    socket.emit('message', { carpoolId: carpool._id, text });
    setText('');
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[420px] h-[520px] flex flex-col shadow-xl">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          {carpool.from} → {carpool.to}
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={onClose}>✕</Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
        {messages.map((m) => (
          <div key={m._id} className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">
              {m.sender.name}
            </p>
            <p className="leading-relaxed">
              {m.message}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </CardContent>

      <div className="p-3 border-t flex gap-2">
        <Input
          className="text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <Button size="sm" onClick={send}>Send</Button>
      </div>
    </Card>
  );
}
