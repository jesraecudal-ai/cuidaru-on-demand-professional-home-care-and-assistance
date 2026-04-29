import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Eye, Trash2, ExternalLink, FileText, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DEPT_LABELS = { it: 'IT & Technology', accounting_finance: 'Accounting & Finance', marketing: 'Marketing' };
const DEPT_COLORS = { it: 'bg-blue-100 text-blue-700', accounting_finance: 'bg-green-100 text-green-700', marketing: 'bg-purple-100 text-purple-700' };
const STATUS_COLORS = {
  new: 'bg-gray-100 text-gray-600',
  reviewing: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interviewed: 'bg-purple-100 text-purple-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const BLANK_JOB = { title: '', department: 'it', type: 'full_time', location: '', description: '', requirements: [] };

export default function AdminCareers() {
  const queryClient = useQueryClient();
  const [jobModal, setJobModal] = useState(null); // null | 'new' | job object
  const [appModal, setAppModal] = useState(null);
  const [reqInput, setReqInput] = useState('');
  const [jobForm, setJobForm] = useState(BLANK_JOB);

  const { data: jobs = [] } = useQuery({ queryKey: ['adminJobs'], queryFn: () => base44.entities.JobPosting.list('-created_date') });
  const { data: applications = [] } = useQuery({ queryKey: ['adminApplications'], queryFn: () => base44.entities.JobApplication.list('-created_date') });

  const createJob = useMutation({
    mutationFn: (data) => base44.entities.JobPosting.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminJobs'] }); setJobModal(null); toast.success('Job posted!'); },
  });

  const updateJob = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobPosting.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminJobs'] }); setJobModal(null); toast.success('Job updated!'); },
  });

  const deleteJob = useMutation({
    mutationFn: (id) => base44.entities.JobPosting.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminJobs'] }); toast.success('Job deleted.'); },
  });

  const updateApp = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobApplication.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminApplications'] }); },
  });

  const openNewJob = () => { setJobForm(BLANK_JOB); setReqInput(''); setJobModal('new'); };
  const openEditJob = (job) => { setJobForm({ ...job }); setReqInput(''); setJobModal(job); };

  const handleSaveJob = () => {
    if (!jobForm.title) { toast.error('Title is required'); return; }
    if (jobModal === 'new') createJob.mutate(jobForm);
    else updateJob.mutate({ id: jobModal.id, data: jobForm });
  };

  const addReq = () => {
    if (reqInput.trim()) {
      setJobForm(f => ({ ...f, requirements: [...(f.requirements || []), reqInput.trim()] }));
      setReqInput('');
    }
  };

  const removeReq = (i) => setJobForm(f => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }));

  const appsByJob = applications.reduce((acc, app) => {
    acc[app.job_id] = (acc[app.job_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" /> Careers Admin
          </h1>
          <p className="text-gray-500 mt-1">Manage job postings and review applications</p>
        </div>
        <Button onClick={openNewJob} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" /> New Job Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Jobs', value: jobs.length },
          { label: 'Active Jobs', value: jobs.filter(j => j.is_active).length },
          { label: 'Total Applications', value: applications.length },
          { label: 'New Applications', value: applications.filter(a => a.status === 'new').length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="mb-6">
          <TabsTrigger value="jobs" className="gap-2"><Briefcase className="w-4 h-4" /> Job Postings ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications" className="gap-2"><FileText className="w-4 h-4" /> Applications ({applications.length})</TabsTrigger>
        </TabsList>

        {/* JOB POSTINGS */}
        <TabsContent value="jobs">
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No job postings yet. Create your first one!</p>
              </div>
            ) : jobs.map(job => (
              <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-1">
                    <Badge className={`${DEPT_COLORS[job.department]} border-0 text-xs`}>{DEPT_LABELS[job.department]}</Badge>
                    <Badge variant="outline" className="text-xs">{job.type?.replace('_', ' ')}</Badge>
                    {!job.is_active && <Badge className="bg-red-100 text-red-600 border-0 text-xs">Inactive</Badge>}
                  </div>
                  <h3 className="font-bold text-gray-900">{job.title}</h3>
                  {job.location && <p className="text-sm text-gray-500">{job.location}</p>}
                  <p className="text-xs text-gray-400 mt-1">{appsByJob[job.id] || 0} application(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditJob(job)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => { if (confirm('Delete this job?')) deleteJob.mutate(job.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* APPLICATIONS */}
        <TabsContent value="applications">
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No applications received yet.</p>
              </div>
            ) : applications.map(app => (
              <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-1">
                    {app.department && <Badge className={`${DEPT_COLORS[app.department]} border-0 text-xs`}>{DEPT_LABELS[app.department]}</Badge>}
                    <Badge className={`${STATUS_COLORS[app.status]} border-0 text-xs capitalize`}>{app.status}</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900">{app.full_name}</h3>
                  <p className="text-sm text-gray-500">{app.job_title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</p>
                  {app.created_date && <p className="text-xs text-gray-400 mt-0.5">Applied {format(new Date(app.created_date), 'MMM d, yyyy')}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={app.status} onValueChange={val => updateApp.mutate({ id: app.id, data: { status: val } })}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAppModal(app)}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Edit/Create Modal */}
      <Dialog open={!!jobModal} onOpenChange={() => setJobModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{jobModal === 'new' ? 'New Job Posting' : 'Edit Job Posting'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title *</label>
              <Input placeholder="e.g. Senior React Developer" value={jobForm.title} onChange={e => setJobForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
                <Select value={jobForm.department} onValueChange={v => setJobForm(f => ({...f, department: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">IT & Technology</SelectItem>
                    <SelectItem value="accounting_finance">Accounting & Finance</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                <Select value={jobForm.type} onValueChange={v => setJobForm(f => ({...f, type: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-Time</SelectItem>
                    <SelectItem value="part_time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
              <Input placeholder="e.g. Remote / São Paulo, Brazil" value={jobForm.location} onChange={e => setJobForm(f => ({...f, location: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea rows={4} placeholder="Role overview and responsibilities..." value={jobForm.description} onChange={e => setJobForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Requirements / Skills</label>
              <div className="flex gap-2 mb-2">
                <Input placeholder="e.g. React, 3+ years experience" value={reqInput} onChange={e => setReqInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())} />
                <Button type="button" variant="outline" onClick={addReq}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(jobForm.requirements || []).map((r, i) => (
                  <span key={i} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                    {r}
                    <button onClick={() => removeReq(i)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={jobForm.is_active !== false} onChange={e => setJobForm(f => ({...f, is_active: e.target.checked}))} className="rounded" />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to applicants)</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setJobModal(null)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSaveJob}>
                {jobModal === 'new' ? 'Post Job' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Detail Modal */}
      <Dialog open={!!appModal} onOpenChange={() => setAppModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {appModal && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {appModal.department && <Badge className={`${DEPT_COLORS[appModal.department]} border-0`}>{DEPT_LABELS[appModal.department]}</Badge>}
                <Badge className={`${STATUS_COLORS[appModal.status]} border-0 capitalize`}>{appModal.status}</Badge>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-900">{appModal.full_name}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{appModal.email}</span></div>
                {appModal.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{appModal.phone}</span></div>}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Applied For</p>
                <p className="text-gray-900">{appModal.job_title}</p>
              </div>
              {appModal.linkedin_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">LinkedIn</p>
                  <a href={appModal.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    {appModal.linkedin_url} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
              {appModal.portfolio_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Portfolio</p>
                  <a href={appModal.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    {appModal.portfolio_url} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
              {appModal.cover_letter && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{appModal.cover_letter}</p>
                </div>
              )}
              {appModal.resume_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Resume</p>
                  <a href={appModal.resume_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="w-4 h-4" /> Download Resume
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Update Status</p>
                <Select value={appModal.status} onValueChange={val => { updateApp.mutate({ id: appModal.id, data: { status: val } }); setAppModal({...appModal, status: val}); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes</p>
                <Textarea rows={3} placeholder="Internal notes..." defaultValue={appModal.admin_notes}
                  onBlur={e => updateApp.mutate({ id: appModal.id, data: { admin_notes: e.target.value } })} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}