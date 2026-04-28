import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Shield } from 'lucide-react';
import { detectBypass } from '@/lib/constants';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ChatWindow({ conversationId, currentUser, currentUserRole, clientEmail, providerId, providerEmail, otherPersonName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    base44.entities.ChatMessage.filter({ conversation_id: conversationId }, 'created_date').then(setMessages);

    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        setMessages(prev => {
          if (event.type === 'create') return [...prev, event.data];
          if (event.type === 'update') return prev.map(m => m.id === event.id ? event.data : m);
          if (event.type === 'delete') return prev.filter(m => m.id !== event.id);
          return prev;
        });
      }
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (detectBypass(trimmed)) {
      toast.error('For safety, personal contact details and external payment references are not allowed in chat.');
      return;
    }
    setSending(true);
    await base44.entities.ChatMessage.create({
      conversation_id: conversationId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      sender_role: currentUserRole,
      content: trimmed,
      client_email: clientEmail,
      provider_id: providerId,
      provider_email: providerEmail,
    });
    setText('');
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const roleColor = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'provider') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            Start the conversation. All messages are monitored for safety.
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_email === currentUser.email;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className="flex items-center gap-2">
                  {!isMe && <span className="text-xs font-medium text-gray-600">{msg.sender_name}</span>}
                  <Badge className={`text-xs py-0 px-1.5 ${roleColor(msg.sender_role)}`}>{msg.sender_role}</Badge>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400">{format(new Date(msg.created_date), 'MMM d, HH:mm')}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2 items-end bg-white">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message... (no personal contacts or external payments)"
          rows={2}
          className="flex-1 resize-none text-sm"
        />
        <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon" className="h-10 w-10 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}