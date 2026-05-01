import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useUserProfile } from '@/lib/useUserProfile';
import { Briefcase, MapPin, DollarSign, Clock, AlertTriangle, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LocationPicker from '@/components/location/LocationPicker';

export default function Jobs() {
  const { t } = useI18n();
  const { user, profile } = useUserProfile();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['job-orders'],
    queryFn: () => base44.entities.JobOrder.list('-created_date', 100),
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['all-providers'],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 200),
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
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

  const canEditJob = (job) => {
    return user?.email === job.client_email || user?.role === 'admin';
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditFormData({ ...job });
  };

  const handleSaveJob = async () => {
    try {
      await base44.entities.JobOrder.update(editingJob.id, editFormData);
      toast.success(t('changes_saved'));
      setEditingJob(null);
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const getCurrencyForCountry = (country) => {
    if (country === 'uruguay') return { symbol: '$', code: 'UYU' };
    if (country === 'brazil') return { symbol: 'R$', code: 'BRL' };
    return { symbol: '$', code: 'USD' };
  };

  const getProfileByEmail = (email) => {
    return providers.find(p => p.user_email === email);
  };

  const getUserProfileByEmail = (email) => {
    return userProfiles.find(p => p.user_email === email);
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

                {/* Client Info - Clickable Profile */}
                <div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setSelectedProfile(getProfileByEmail(selectedJob.client_email))}
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Posted by</h3>
                  <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                        {getProfileByEmail(selectedJob.client_email)?.avatar_url ? (
                          <img src={getProfileByEmail(selectedJob.client_email).avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">{(selectedJob.client_name || 'A')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{selectedJob.client_name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{selectedJob.client_email}</p>
                    </div>
                    {getUserProfileByEmail(selectedJob.client_email)?.company_logo_url && (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 flex items-center justify-center mb-2 bg-white rounded-lg p-2 border border-gray-300">
                          <img src={getUserProfileByEmail(selectedJob.client_email).company_logo_url} alt="" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-gray-700 font-semibold text-sm">{getUserProfileByEmail(selectedJob.client_email).company_name}</p>
                        {getUserProfileByEmail(selectedJob.client_email)?.position && (
                          <p className="text-xs text-gray-600">{getUserProfileByEmail(selectedJob.client_email).position}</p>
                        )}
                      </div>
                    )}
                  </div>
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

            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Submit Proposal
              </Button>
              {canEditJob(selectedJob) && (
                <Button variant="outline" onClick={() => handleEditClick(selectedJob)} className="gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              )}
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

      {/* Profile Modal */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => { if (!open) setSelectedProfile(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Provider Profile</DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {selectedProfile.avatar_url ? (
                    <img src={selectedProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-semibold text-gray-600">{(selectedProfile.full_name || 'P')[0].toUpperCase()}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProfile.full_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedProfile.user_email}</p>
                {getUserProfileByEmail(selectedProfile.user_email)?.company_name && (
                  <div className="mt-3 pt-3 border-t">
                    {getUserProfileByEmail(selectedProfile.user_email)?.company_logo_url && (
                      <img src={getUserProfileByEmail(selectedProfile.user_email).company_logo_url} alt="" className="h-8 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-semibold text-gray-700">{getUserProfileByEmail(selectedProfile.user_email).company_name}</p>
                  </div>
                )}
              </div>

              {selectedProfile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
                  <p className="text-sm text-gray-700">{selectedProfile.bio}</p>
                </div>
              )}

              {selectedProfile.categories && selectedProfile.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.categories.map(cat => (
                      <Badge key={cat} variant="outline" className="capitalize">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.hourly_rate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Hourly Rate</h3>
                  <p className="text-sm text-gray-900 font-semibold">${selectedProfile.hourly_rate}</p>
                </div>
              )}

              {selectedProfile.verification_status === 'verified' && (
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                  <p className="text-sm font-semibold text-green-700">✓ Verified</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(open) => { if (!open) setEditingJob(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows="4"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={editFormData.category || ''} onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caregiver">Caregiver</SelectItem>
                  <SelectItem value="assistant_nurse">Assistant Nurse</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="social_worker">Social Worker</SelectItem>
                  <SelectItem value="house_cleaner">House Cleaner</SelectItem>
                  <SelectItem value="cook">Cook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ({getCurrencyForCountry(profile?.country).code})</label>
                <Input
                  type="number"
                  value={editFormData.budget || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Type</label>
                <Select value={editFormData.budget_type || 'hourly'} onValueChange={(value) => setEditFormData({ ...editFormData, budget_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <LocationPicker
                onLocationSelect={(location) => setEditFormData({ ...editFormData, location_text: location.address })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{editFormData.location_text || 'Select location on map'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={editFormData.status || 'open'} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={handleSaveJob}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}