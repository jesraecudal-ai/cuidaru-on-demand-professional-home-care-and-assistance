import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { useI18n } from '@/lib/i18n';
import { MessageCircle, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';

export default function Messages() {
  const { t } = useI18n();
  const { user, profile } = useUserProfile();
  const [providerProfile, setProviderProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) return;
    base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) setProviderProfile(list[0]);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, providerProfile]);

  const loadConversations = async () => {
    setLoading(true);
    let messages = [];

    if (isAdmin) {
      // Admins see all conversations
      messages = await base44.entities.ChatMessage.list('-created_date', 200);
    } else if (providerProfile) {
      // Provider: conversations where they are provider
      messages = await base44.entities.ChatMessage.filter({ provider_id: providerProfile.id }, '-created_date');
    } else {
      // Client: conversations where they are client
      messages = await base44.entities.ChatMessage.filter({ client_email: user.email }, '-created_date');
    }

    // Group by conversation_id
    const convMap = {};
    messages.forEach(msg => {
      const cid = msg.conversation_id;
      if (!convMap[cid]) {
        convMap[cid] = {
          id: cid,
          conversationId: cid,
          clientEmail: msg.client_email,
          providerId: msg.provider_id,
          providerEmail: msg.provider_email,
          lastMessage: msg.content,
          lastDate: msg.created_date,
          otherName: '',
        };
      } else {
        // Keep the latest message
        if (new Date(msg.created_date) > new Date(convMap[cid].lastDate)) {
          convMap[cid].lastMessage = msg.content;
          convMap[cid].lastDate = msg.created_date;
        }
      }
    });

    // Determine "other" person name
    const convList = Object.values(convMap).map(conv => {
      const relevantMsgs = messages.filter(m => m.conversation_id === conv.id);
      const other = relevantMsgs.find(m => m.sender_email !== user.email);
      const me = relevantMsgs.find(m => m.sender_email === user.email);

      let otherName = other?.sender_name || conv.providerEmail || conv.providerId;
      if (isAdmin) {
        const clientMsg = relevantMsgs.find(m => m.sender_role === 'client');
        const providerMsg = relevantMsgs.find(m => m.sender_role === 'provider');
        const clientName = clientMsg?.sender_name || conv.clientEmail || 'Client';
        const providerName = providerMsg?.sender_name || 'Provider';
        otherName = `${clientName} ↔ ${providerName}`;
      }

      return { ...conv, otherName };
    });

    convList.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    setConversations(convList);
    setLoading(false);
  };

  // Determine current user role for chat
  const chatRole = isAdmin ? 'admin' : providerProfile ? 'provider' : 'client';

  const selectedConv = conversations.find(c => c.id === selected?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-7 h-7 text-blue-600" /> {t('messages')}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{t('conversations')}</span>
              {isAdmin && <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{t('admin')}</span>}
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
            )}
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {selected ? (
              <ChatWindow
                conversationId={selected.id}
                currentUser={user}
                currentUserRole={chatRole}
                clientEmail={selected.clientEmail}
                providerId={selected.providerId}
                providerEmail={selected.providerEmail}
                otherPersonName={selected.otherName}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle className="w-12 h-12 mb-3 text-gray-200" />
                <p className="text-sm">{t('select_conversation')}</p>
                {!isAdmin && !providerProfile && (
                  <p className="text-xs mt-2 text-gray-300">{t('visit_provider_to_chat')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}