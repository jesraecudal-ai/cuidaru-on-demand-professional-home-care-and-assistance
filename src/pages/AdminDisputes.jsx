import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { AlertTriangle, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DisputeCard from '@/components/disputes/DisputeCard';

export default function AdminDisputes() {
  const { t } = useI18n();
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('access_restricted')}</h2>
        <p className="text-gray-500">{t('admin_only_disputes')}</p>
      </div>
    );
  }

  const openCount = disputes.filter(d => d.status === 'open').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-orange-500" /> {t('dispute_management')}
          </h1>
          {openCount > 0 && (
            <p className="text-sm text-orange-600 mt-1 font-medium">{openCount} {t('open_disputes_requiring_attention')}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_disputes')}</SelectItem>
              <SelectItem value="open">{t('open')}</SelectItem>
              <SelectItem value="under_review">{t('under_review')}</SelectItem>
              <SelectItem value="resolved_client">{t('resolved_client')}</SelectItem>
              <SelectItem value="resolved_provider">{t('resolved_provider')}</SelectItem>
              <SelectItem value="resolved_split">{t('resolved_split')}</SelectItem>
              <SelectItem value="closed">{t('closed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{t('no_disputes_found')}</p>
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