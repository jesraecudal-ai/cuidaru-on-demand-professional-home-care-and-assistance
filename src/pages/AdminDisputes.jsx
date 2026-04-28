import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { AlertTriangle, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DisputeCard from '@/components/disputes/DisputeCard';

export default function AdminDisputes() {
  const { user } = useUserProfile();
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['disputes', statusFilter],
    queryFn: async () => {
      const all = await base44.entities.Dispute.list('-created_date');
      if (statusFilter === 'all') return all;
      return all.filter(d => d.status === statusFilter);
    },
    enabled: !!user,
  });

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-500">Only administrators can access the disputes panel.</p>
      </div>
    );
  }

  const openCount = disputes.filter(d => d.status === 'open').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-orange-500" /> Dispute Management
          </h1>
          {openCount > 0 && (
            <p className="text-sm text-orange-600 mt-1 font-medium">{openCount} open dispute{openCount > 1 ? 's' : ''} requiring attention</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disputes</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved_client">Resolved — Client</SelectItem>
              <SelectItem value="resolved_provider">Resolved — Provider</SelectItem>
              <SelectItem value="resolved_split">Resolved — Split</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No disputes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(d => (
            <DisputeCard
              key={d.id}
              dispute={d}
              isAdmin={true}
              onUpdated={() => queryClient.invalidateQueries({ queryKey: ['disputes'] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}