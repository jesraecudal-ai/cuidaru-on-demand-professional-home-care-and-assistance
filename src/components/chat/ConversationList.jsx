import React from 'react';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

export default function ConversationList({ conversations, selectedId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm px-4">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        No conversations yet
      </div>
    );
  }

  return (
    <div className="divide-y overflow-y-auto">
      {conversations.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedId === conv.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{conv.otherName}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
            </div>
            {conv.lastDate && (
              <span className="text-xs text-gray-400 shrink-0">{format(new Date(conv.lastDate), 'MMM d')}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}