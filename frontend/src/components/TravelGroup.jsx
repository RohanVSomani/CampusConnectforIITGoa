import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket';
import { api } from '@/lib/api';

export default function TravelGroup() {
  const { matchId } = useParams();
  const { socket } = useSocket('/travel-chat');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    api.get(`/chat/${matchId}`).then(res => setMessages(res.data.data));
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-travel', { matchId });

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off('new-message');
  }, [socket, matchId]);

  function send() {
    if (!text.trim()) return;
    socket.emit('send-message', { matchId, text });
    setText('');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Travel Group Chat</h2>

      <div className="border rounded-lg p-3 h-[400px] overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m._id}>
            <strong>{m.sender?.name}</strong>: {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={send} className="bg-primary text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
