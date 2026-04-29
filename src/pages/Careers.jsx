import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ChevronRight, ArrowLeft, Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const DEPT_LABELS = {
  it: 'IT & Technology',
  accounting_finance: 'Accounting & Finance',
  marketing: 'Marketing',
};

const DEPT_COLORS = {
  it: 'bg-blue-100 text-blue-700',
  accounting_finance: 'bg-green-100 text-green-700',
  marketing: 'bg-purple-100 text-purple-700',
};

const TYPE_LABELS = {
  full_time: 'Full-Time',
  part_time: 'Part-Time',
  contract: 'Contract',
  remote: 'Remote',
};

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterDept, setFilterDept] = useState('all');
  const [resumeFile, setResumeFile] = useState(null);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', linkedin_url: '', portfolio_url: '', cover_letter: '',
  });

  useEffect(() => {
    base44.entities.JobPosting.filter({ is_active: true }).then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowForm(true);
    setSubmitted(false);
    setForm({ full_name: '', email: '', phone: '', linkedin_url: '', portfolio_url: '', cover_letter: '' });
    setResumeFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast.error('Please fill in your name and email.');
      return;
    }
    setSubmitting(true);
    let resume_url = '';
    if (resumeFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: resumeFile });
      resume_url = file_url;
    }
    await base44.entities.JobApplication.create({
      job_id: selectedJob.id,
      job_title: selectedJob.title,
      department: selectedJob.department,
      ...form,
      resume_url,
      status: 'new',
    });

    // Send confirmation email to applicant + notify admins
    await Promise.all([
      base44.functions.invoke('sendEmailNotification', {
        template: 'job_application_confirmation',
        to: form.email,
        data: { applicantName: form.full_name, jobTitle: selectedJob.title },
      }).catch(() => {}),
      base44.functions.invoke('sendEmailNotification', {
        template: 'job_application_received',
        to: 'careers@cuidaru.com',
        data: {
          applicantName: form.full_name,
          jobTitle: selectedJob.title,
          department: selectedJob.department,
        },
      }).catch(() => {}),
    ]);

    setSubmitting(false);
    setSubmitted(true);
  };

  const filteredJobs = filterDept === 'all' ? jobs : jobs.filter(j => j.department === filterDept);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>

          {submitted ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-2">Thank you, <strong>{form.full_name}</strong>!</p>
              <p className="text-gray-500 mb-6">We've received your application for <strong>{selectedJob.title}</strong>. Our team will review it and get back to you at <strong>{form.email}</strong>.</p>
              <Button onClick={() => setShowForm(false)}>View More Jobs</Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <Badge className={`${DEPT_COLORS[selectedJob.department]} border-0 mb-3`}>{DEPT_LABELS[selectedJob.department]}</Badge>
                <h1 className="text-2xl font-bold">{selectedJob.title}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-blue-100 text-sm">
                  {selectedJob.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{TYPE_LABELS[selectedJob.type]}</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-800">Your Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                    <Input placeholder="Jane Doe" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                    <Input type="email" placeholder="jane@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                    <Input placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn URL</label>
                    <Input placeholder="linkedin.com/in/..." value={form.linkedin_url} onChange={e => setForm({...form, linkedin_url: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Portfolio / Website URL</label>
                  <Input placeholder="https://yoursite.com" value={form.portfolio_url} onChange={e => setForm({...form, portfolio_url: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cover Letter</label>
                  <Textarea placeholder="Tell us why you'd be a great fit for this role..." rows={5} value={form.cover_letter} onChange={e => setForm({...form, cover_letter: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Resume / CV</label>
                  {resumeFile ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 flex-1 truncate">{resumeFile.name}</span>
                      <button type="button" onClick={() => setResumeFile(null)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload PDF, DOC, DOCX</span>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
                    </label>
                  )}
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            We're Hiring!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join the Cuidaru Team</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Help us build the most trusted care platform in Latin America. We're looking for talented, passionate people to join our growing team.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        {/* Why join us */}
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {[
            { emoji: '🌎', title: 'Global Impact', desc: 'Your work directly improves lives across 4+ countries.' },
            { emoji: '🚀', title: 'Fast Growth', desc: 'Be part of a startup scaling rapidly across Latin America.' },
            { emoji: '💙', title: 'Mission Driven', desc: 'We care about care — every role matters here.' },
          ].map(item => (
            <div key={item.title} className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'it', 'accounting_finance', 'marketing'].map(dept => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterDept === dept ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {dept === 'all' ? 'All Departments' : DEPT_LABELS[dept]}
            </button>
          ))}
        </div>

        {/* Job listings */}
        {loading ? (
          <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No open positions in this department right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={`${DEPT_COLORS[job.department]} border-0 text-xs`}>{DEPT_LABELS[job.department]}</Badge>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[job.type]}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    {job.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </p>
                    )}
                    {job.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>}
                  </div>
                  <Button onClick={() => handleApply(job)} className="bg-blue-600 hover:bg-blue-700 gap-2 shrink-0">
                    Apply Now <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {job.requirements?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.map((r, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-400">
          Don't see your role? <a href="mailto:careers@cuidaru.com" className="text-blue-600 hover:underline">Send us your resume anyway →</a>
        </div>
      </div>

      <div className="text-center pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}