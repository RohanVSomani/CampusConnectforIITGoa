import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useCarpoolChatSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CarpoolChat({ carpool, onClose }) {
  const { socket, connected } = useCarpoolChatSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  /* ===============================
     Load chat history (REST)
     =============================== */
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get(`/carpool-chat/${carpool._id}`);
        setMessages(res.data.data || []); // ✅ FIXED
      } catch (err) {
        console.error('Chat history error:', err);
      }
    }

    loadHistory();
  }, [carpool._id]);

  /* ===============================
     Join / leave socket room
     =============================== */
     useEffect(() => {
      if (!socket || !connected) return;
    
      // ✅ correct event for /carpool-chat
      socket.emit('join', { carpoolId: carpool._id });
    
      socket.on('message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    
      return () => {
        socket.off('message');
      };
    }, [socket, connected, carpool._id]);
    

  /* ===============================
     Auto-scroll
     =============================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ===============================
     Send message
     =============================== */
  function send() {
    if (!text.trim() || !socket || !connected) return;

    socket.emit('message', {
      carpoolId: carpool._id,
      text,
    });

    setText('');
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[420px] h-[520px] flex flex-col shadow-xl z-50">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          {carpool.from} → {carpool.to}
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
        {messages.map((m) => (
          <div key={m._id} className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">
              {m.sender?.name || 'User'}
            </p>
            <p className="leading-relaxed">{m.message}</p>
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
        <Button size="sm" onClick={send} disabled={!connected}>
          Send
        </Button>
      </div>
    </Card>
  );
}
