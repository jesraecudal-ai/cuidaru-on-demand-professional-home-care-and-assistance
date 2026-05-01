import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useUserProfile } from '@/lib/useUserProfile';
import { Briefcase, MapPin, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function Jobs() {
  const { t } = useI18n();
  const { user, profile } = useUserProfile();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['job-orders'],
    queryFn: () => base44.entities.JobOrder.list('-created_date', 100),
  });

  const currencyMap = {
    uruguay: { symbol: '$', code: 'UYU' },
    brazil: { symbol: 'R$', code: 'BRL' },
    usa: { symbol: '$', code: 'USD' },
    canada: { symbol: '$', code: 'CAD' },
    philippines: { symbol: '₱', code: 'PHP' },
  };

  const getCurrency = () => {
    return currencyMap[profile?.country] || currencyMap.usa;
  };

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(job =>
      job.title?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      job.category?.toLowerCase().includes(q) ||
      job.location_text?.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const categoryColors = {
    caregiver: 'bg-blue-100 text-blue-700',
    assistant_nurse: 'bg-green-100 text-green-700',
    nurse: 'bg-red-100 text-red-700',
    doctor: 'bg-purple-100 text-purple-700',
    social_worker: 'bg-orange-100 text-orange-700',
    house_cleaner: 'bg-yellow-100 text-yellow-700',
    cook: 'bg-pink-100 text-pink-700',
    default: 'bg-gray-100 text-gray-700',
  };

  const budgetTypeLabels = {
    hourly: t('hourly'),
    daily: t('daily'),
    weekly: t('weekly'),
    fixed: t('fixed'),
  };

  const statusColors = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex gap-4 px-4 py-4">
      {/* Left Panel - Job List */}
      <div className="w-full md:w-96 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Job Board</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded" />)}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('no_jobs_found')}</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{job.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{job.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={categoryColors[job.category] || categoryColors.default} variant="outline">
                      {job.category}
                    </Badge>
                    <Badge variant="outline" className={statusColors[job.status] || 'bg-gray-100'}>
                      {job.status}
                    </Badge>
                  </div>
                  {job.budget && (
                    <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {getCurrency().symbol} {job.budget} {budgetTypeLabels[job.budget_type] || job.budget_type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Job Details */}
      <div className="hidden md:flex flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex-col">
        {selectedJob ? (
          <>
            <div className="p-6 border-b overflow-y-auto flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{selectedJob.title}</h1>
                <div className="flex gap-3 flex-wrap">
                  <Badge className={categoryColors[selectedJob.category] || categoryColors.default}>
                    {selectedJob.category}
                  </Badge>
                  <Badge variant="outline" className={statusColors[selectedJob.status]}>
                    {selectedJob.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                {/* Budget */}
                {selectedJob.budget && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Budget
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {getCurrency().symbol} {selectedJob.budget} <span className="text-sm text-gray-500">{budgetTypeLabels[selectedJob.budget_type] || selectedJob.budget_type}</span>
                    </p>
                  </div>
                )}

                {/* Location */}
                {selectedJob.location_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location
                    </h3>
                    <p className="text-gray-900">{selectedJob.location_text}</p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {/* Client Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Client</h3>
                  <p className="text-gray-900">{selectedJob.client_name}</p>
                  <p className="text-sm text-gray-500">{selectedJob.client_email}</p>
                </div>

                {/* Posted Date */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Posted
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedJob.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Submit Proposal
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            <div>
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a job to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}