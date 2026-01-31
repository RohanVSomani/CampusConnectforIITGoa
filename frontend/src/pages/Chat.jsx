import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSocket } from '@/lib/socket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Chat() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [text, setText] = useState('');
  const { socket } = useSocket('/chat');

  useEffect(() => {
    async function loadChat() {
      const res = await api.get(`/chat/${matchId}`);
      console.log("📩 Chat API response:", res);
      setMessages(res.data.messages);
      setMembers(res.data.members);
    }
    loadChat();
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join', { matchId });

    socket.on('message', (msg) => {
      setMessages((m) => [...m, msg]);
    });

    return () => socket.off('message');
  }, [socket, matchId]);

  function sendMessage() {
    if (!text.trim()) return;
    socket.emit('message', { matchId, text });
    setText('');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Travel Group Chat</h1>

      <div className="flex gap-2">
        {members.map((m) => (
          <span key={m._id} className="px-2 py-1 bg-muted rounded text-sm">
            {m.name}
          </span>
        ))}
      </div>

      <div className="border rounded-lg h-[400px] p-3 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m._id}>
            <b>{m.sender?.name}:</b> {m.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
