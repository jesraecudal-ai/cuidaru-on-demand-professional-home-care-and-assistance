import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

export default function AnaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [showForm, setShowForm] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    if (!userInfo.name.trim() || !userInfo.email.trim()) return;

    const newConversation = await base44.agents.createConversation({
      agent_name: 'ana',
      metadata: { 
        name: 'Help Chat', 
        description: 'User support conversation',
        user_name: userInfo.name,
        user_email: userInfo.email
      }
    });
    setConversationId(newConversation.id);
    setMessages(newConversation.messages || []);
    setShowForm(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId && isOpen) {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        if (data.messages) {
          setMessages(data.messages);
          setIsLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, [conversationId, isOpen]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 group"
          aria-label="Open Ana chat"
        >
          <div className="flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute bottom-full mb-3 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-bounce">
              Need help?
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div>
              <h3 className="font-semibold">Ana</h3>
              <p className="text-xs text-blue-100">Cuidaru Assistant</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Form */}
          {showForm && (
            <form onSubmit={handleSubmitInfo} className="flex-1 flex flex-col p-4 space-y-3 justify-center">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 font-medium">Let's get started!</p>
                <p className="text-xs text-gray-500 mt-1">We'd love to know who we're helping</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="text-sm"
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full"
                disabled={!userInfo.name.trim() || !userInfo.email.trim()}
              >
                Start Chat
              </Button>
            </form>
          )}

          {/* Messages */}
          {!showForm && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Hi! I'm Ana. How can I help you today?</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            a: ({ children, href }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                {children}
                              </a>
                            ),
                            ul: ({ children }) => <ul className="ml-4 list-disc mb-1">{children}</ul>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          )}

          {/* Input */}
          {!showForm && (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
            <Input
              type="text"
              placeholder="Ask Ana..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          )}
        </div>
      )}
    </>
  );
}