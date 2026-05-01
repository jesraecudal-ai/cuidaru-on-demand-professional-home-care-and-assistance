import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Shield, ArrowLeftRight, AlertTriangle, Image as ImageIcon, Loader, User } from 'lucide-react';
import { detectBypass } from '@/lib/constants';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CounterOfferBubble from './CounterOfferBubble';
import CounterOfferForm from './CounterOfferForm';
import ProfilePopup from './ProfilePopup';

export default function ChatWindow({
  conversationId, currentUser, currentUserRole,
  clientEmail, providerId, providerEmail, otherPersonName,
  booking // optional: active booking for this conversation
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [activeBooking, setActiveBooking] = useState(booking || null);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [otherPersonAvatarUrl, setOtherPersonAvatarUrl] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load avatar for the other person
  useEffect(() => {
    if (providerId && currentUser) {
      // If current user is a client, load provider's avatar
      base44.entities.ServiceProvider.filter({ id: providerId }).then(list => {
        if (list[0]?.avatar_url) setOtherPersonAvatarUrl(list[0].avatar_url);
      }).catch(() => {});
    }
  }, [providerId, currentUser]);

  // Load active booking for this conversation if not passed in
  useEffect(() => {
    if (booking) { setActiveBooking(booking); return; }
    if (!clientEmail || !providerId) return;
    base44.entities.Booking.filter({ client_email: clientEmail, provider_id: providerId })
      .then(list => {
        // Find the most recent non-cancelled booking
        const active = list
          .filter(b => !['cancelled', 'payment_released', 'refunded'].includes(b.status))
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
        if (active) setActiveBooking(active);
      });
  }, [clientEmail, providerId, booking]);

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
      message_type: 'text',
      client_email: clientEmail,
      provider_id: providerId,
      provider_email: providerEmail,
    });
    setText('');
    setSending(false);
  };

  const handleSendOffer = async ({ amount, bookingType, duration, startDate, note }) => {
    if (!activeBooking) return;
    setSending(true);

    // Mark all previous pending counter offers as superseded
    const prevOffers = messages.filter(
      m => m.message_type === 'counter_offer' && m.offer_status === 'pending'
    );
    await Promise.all(prevOffers.map(m => base44.entities.ChatMessage.update(m.id, { offer_status: 'superseded' })));

    // Create the counter offer message
    await base44.entities.ChatMessage.create({
      conversation_id: conversationId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      sender_role: currentUserRole,
      content: note || '[counter_offer]',
      message_type: 'counter_offer',
      offer_booking_id: activeBooking.id,
      offer_amount: amount,
      offer_booking_type: bookingType,
      offer_duration: duration,
      offer_start_date: startDate,
      offer_status: 'pending',
      client_email: clientEmail,
      provider_id: providerId,
      provider_email: providerEmail,
    });

    // Update the booking to counter_offered status
    await base44.entities.Booking.update(activeBooking.id, {
      status: 'counter_offered',
      counter_offer_amount: amount,
      counter_offer_by: currentUser.email,
      counter_offer_booking_type: bookingType,
      counter_offer_duration: duration,
      counter_offer_start_date: startDate,
      counter_offer_note: note,
    });

    setActiveBooking(prev => ({ ...prev, status: 'counter_offered', counter_offer_amount: amount, counter_offer_by: currentUser.email }));
    setShowOfferForm(false);
    setSending(false);
    toast.success('Counter offer sent!');
  };

  const handleAcceptOffer = async (offerMsg) => {
    setSending(true);
    // Update this offer message to accepted
    await base44.entities.ChatMessage.update(offerMsg.id, { offer_status: 'accepted' });

    // Accept the booking with the offered terms
    await base44.entities.Booking.update(activeBooking.id, {
      status: 'accepted',
      total_amount: offerMsg.offer_amount,
      booking_type: offerMsg.offer_booking_type || activeBooking.booking_type,
      duration: offerMsg.offer_duration || activeBooking.duration,
      start_date: offerMsg.offer_start_date || activeBooking.start_date,
      counter_offer_amount: null,
      counter_offer_by: null,
    });

    setActiveBooking(prev => ({ ...prev, status: 'accepted', total_amount: offerMsg.offer_amount }));

    // Send a system-like text message confirming
    await base44.entities.ChatMessage.create({
      conversation_id: conversationId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      sender_role: currentUserRole,
      content: `✅ Offer accepted! Booking is now confirmed at the agreed amount.`,
      message_type: 'text',
      client_email: clientEmail,
      provider_id: providerId,
      provider_email: providerEmail,
    });

    setSending(false);
    toast.success('Offer accepted! Booking confirmed.');
  };

  const handleDeclineOffer = async (offerMsg) => {
    await base44.entities.ChatMessage.update(offerMsg.id, { offer_status: 'declined' });

    // Revert booking to pending_approval so the other party can counter again
    await base44.entities.Booking.update(activeBooking.id, {
      status: 'pending_approval',
      counter_offer_amount: null,
      counter_offer_by: null,
    });

    setActiveBooking(prev => ({ ...prev, status: 'pending_approval' }));

    await base44.entities.ChatMessage.create({
      conversation_id: conversationId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      sender_role: currentUserRole,
      content: `❌ Offer declined. Feel free to make a new counter offer.`,
      message_type: 'text',
      client_email: clientEmail,
      provider_id: providerId,
      provider_email: providerEmail,
    });

    toast.info('Offer declined.');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Only photos and videos allowed');
      return;
    }

    setUploadingMedia(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_role: currentUserRole,
        content: isImage ? '📷 Photo' : '🎥 Video',
        message_type: 'media',
        media_url: file_url,
        media_type: isImage ? 'image' : 'video',
        client_email: clientEmail,
        provider_id: providerId,
        provider_email: providerEmail,
      });
      toast.success(`${isImage ? 'Photo' : 'Video'} sent!`);
    } catch (err) {
      toast.error('Failed to upload media');
      console.error(err);
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const roleColor = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'provider') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleProfileClick = (msg) => {
    setSelectedProfile({
      email: msg.sender_email,
      role: msg.sender_role,
      name: msg.sender_name,
    });
    setProfilePopupOpen(true);
  };

  // Can make a counter offer if there's an active booking that's not yet paid
  const canCounterOffer = activeBooking && ['pending_approval', 'counter_offered'].includes(activeBooking.status);

  const otherPersonAvatar = otherPersonAvatarUrl;

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header with other person's avatar */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {otherPersonAvatar ? (
            <img src={otherPersonAvatar} alt={otherPersonName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-blue-600">{getInitials(otherPersonName)}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{otherPersonName || '...'}</p>
        </div>
      </div>

      {/* Protection warning for pre-booking chats */}
      {!activeBooking && (
        <div className="px-4 py-3 border-b border-amber-200 bg-amber-50 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900">You're chatting without an active booking</p>
            <p className="text-xs text-amber-700 mt-1">
              For your protection, keep all communication and payments within Cuidaru. Exchanging contact details or arranging outside payments voids our protection policies.
            </p>
          </div>
        </div>
      )}

      {/* Active booking badge */}
      {activeBooking && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <span className="text-xs text-gray-500">Booking:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            activeBooking.status === 'counter_offered' ? 'bg-violet-100 text-violet-700' :
            activeBooking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {activeBooking.status.replace(/_/g, ' ')}
          </span>
          {activeBooking.total_amount && (
            <span className="text-xs font-semibold text-gray-700 ml-auto">
              {activeBooking.counter_offer_amount
                ? `Offered: ${activeBooking.counter_offer_amount}`
                : `Requested: ${activeBooking.total_amount}`}
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Start the conversation. All messages are monitored for safety.</p>
            {!activeBooking && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⚠️ No booking yet — keep contact details inside the app for protection
              </p>
            )}
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_email === currentUser.email;

          if (msg.message_type === 'counter_offer') {
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    {!isMe && (
                      <button
                        onClick={() => handleProfileClick(msg)}
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
                      >
                        {msg.sender_name}
                      </button>
                    )}
                    <Badge className={`text-xs py-0 px-1.5 ${roleColor(msg.sender_role)}`}>{msg.sender_role}</Badge>
                  </div>
                  <CounterOfferBubble
                    msg={msg}
                    isMe={isMe}
                    currentUser={currentUser}
                    booking={activeBooking}
                    onAccept={handleAcceptOffer}
                    onDecline={handleDeclineOffer}
                  />
                  <span className="text-xs text-gray-400">{format(new Date(msg.created_date), 'MMM d, HH:mm')}</span>
                </div>
              </div>
            );
          }

          if (msg.message_type === 'media') {
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    {!isMe && (
                      <button
                        onClick={() => handleProfileClick(msg)}
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
                      >
                        {msg.sender_name}
                      </button>
                    )}
                    <Badge className={`text-xs py-0 px-1.5 ${roleColor(msg.sender_role)}`}>{msg.sender_role}</Badge>
                  </div>
                  {msg.media_type === 'image' ? (
                    <img src={msg.media_url} alt="shared" className="max-w-sm max-h-96 rounded-2xl" />
                  ) : (
                    <video src={msg.media_url} controls className="max-w-sm max-h-96 rounded-2xl" />
                  )}
                  <span className="text-xs text-gray-400">{format(new Date(msg.created_date), 'MMM d, HH:mm')}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className="flex items-center gap-2">
                  {!isMe && (
                    <button
                      onClick={() => handleProfileClick(msg)}
                      className="text-xs font-medium text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {msg.sender_name}
                    </button>
                  )}
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

      {/* Counter offer form */}
      {showOfferForm && activeBooking && (
        <CounterOfferForm
          booking={activeBooking}
          onSubmit={handleSendOffer}
          onCancel={() => setShowOfferForm(false)}
        />
      )}

      {/* Input */}
      {!showOfferForm && (
        <div className="border-t p-3 flex gap-2 items-end bg-white">
          {canCounterOffer && (
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 shrink-0 border-violet-200 text-violet-600 hover:bg-violet-50"
              onClick={() => setShowOfferForm(true)}
              title="Make counter offer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingMedia}
            title="Send photo or video"
          >
            {uploadingMedia ? <Loader className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          </Button>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message..."
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon" className="h-10 w-10 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Profile Popup */}
      {selectedProfile && (
        <ProfilePopup
          isOpen={profilePopupOpen}
          onClose={() => setProfilePopupOpen(false)}
          senderEmail={selectedProfile.email}
          senderRole={selectedProfile.role}
          senderName={selectedProfile.name}
        />
      )}
    </div>
  );
}