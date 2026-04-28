import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { toast } from 'sonner';

export default function StartChatButton({ provider }) {
  const { user } = useUserProfile();
  const navigate = useNavigate();

  const handleStartChat = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (user.email === provider.user_email) {
      toast.info("You can't chat with yourself.");
      return;
    }

    // conversation_id = clientEmail__providerId
    const conversationId = `${user.email}__${provider.id}`;

    // Create a welcome message if conversation is new (even without booking)
    const existing = await base44.entities.ChatMessage.filter({ conversation_id: conversationId });
    if (existing.length === 0) {
      await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_role: 'client',
        content: `Hi ${provider.full_name}! I'm interested in your services and would like to discuss the details.`,
        client_email: user.email,
        provider_id: provider.id,
        provider_email: provider.user_email,
      });
    }

    navigate('/messages');
  };

  return (
    <Button variant="outline" onClick={handleStartChat} className="gap-2 w-full sm:w-auto">
      <MessageCircle className="w-4 h-4" />
      Message Provider
    </Button>
  );
}