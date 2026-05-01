import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import JobProposalModal from './JobProposalModal';
import { CATEGORIES } from '@/lib/constants';

export default function JobOrdersTab({ user, providerProfile }) {
  const queryClient = useQueryClient();
  const [applyingTo, setApplyingTo] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobOrders'],
    queryFn: () => base44.entities.JobOrder.filter({ status: 'open' }, '-created_date'),
  });

  const { data: myProposals = [] } = useQuery({
    queryKey: ['myProposals', providerProfile?.id],
    queryFn: () => base44.entities.JobProposal.filter({ provider_id: providerProfile.id }),
    enabled: !!providerProfile?.id,
  });

  const appliedJobIds = new Set(myProposals.map(p => p.job_order_id));

  const getCategoryIcon = (cat) => CATEGORIES.find(c => c.key === cat)?.icon || '🔧';

  const budgetLabel = (type) => {
    const map = { hourly: '/hr', daily: '/day', weekly: '/wk', fixed: ' fixed' };
    return map[type] || '';
  };

  if (isLoading) {
    return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700">No open jobs yet</h3>
        <p className="text-gray-400">Check back soon — clients will post opportunities here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Browse open job requests from clients and send your proposal.</p>
      {jobs.map(job => {
        const hasApplied = appliedJobIds.has(job.id);
        return (
          <div key={job.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(job.category)}</span>
                  <h3 className="font-semibold text-gray-900 text-base">{job.title}</h3>
                  {job.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {job.category.replace('_', ' ')}
                    </Badge>
                  )}
                  {hasApplied && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Applied
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{job.description}</p>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {job.location_text && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {job.location_text}
                    </span>
                  )}
                  {job.budget && (
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <DollarSign className="w-3.5 h-3.5" /> {job.budget}{budgetLabel(job.budget_type)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Posted by {job.client_name || 'Client'}
                  </span>
                </div>
              </div>

              <div className="sm:ml-4 flex-shrink-0">
                {hasApplied ? (
                  <Button size="sm" variant="outline" disabled className="text-green-600 border-green-200 h-9 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Proposal Sent
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-9 text-xs bg-blue-600 hover:bg-blue-700"
                    onClick={() => setApplyingTo(job)}
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {applyingTo && (
        <JobProposalModal
          job={applyingTo}
          providerProfile={providerProfile}
          user={user}
          onClose={() => setApplyingTo(null)}
          onSuccess={() => {
            setApplyingTo(null);
            queryClient.invalidateQueries({ queryKey: ['myProposals'] });
          }}
        />
      )}
    </div>
  );
}