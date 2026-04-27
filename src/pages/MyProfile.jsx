import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Plus, X, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

const CATEGORIES = [
  'assistant_nurse', 'nurse', 'doctor', 'cleaner',
  'nanny', 'laundry_worker', 'caregiver', 'errand_person'
];

export default function MyProfile() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [isProvider, setIsProvider] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  const [form, setForm] = useState({
    full_name: '', category: 'nurse', bio: '', experience_years: 0,
    hourly_rate: 25, daily_rate: 180, weekly_rate: 800, location: '',
    availability: 'available', skills: [], certifications: [],
    identity_verified: false, avatar_url: '',
  });

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const providers = await base44.entities.ServiceProvider.filter({ user_email: me.email });
      if (providers.length > 0) {
        setIsProvider(true);
        const p = providers[0];
        setForm({
          full_name: p.full_name || me.full_name || '',
          category: p.category || 'nurse',
          bio: p.bio || '',
          experience_years: p.experience_years || 0,
          hourly_rate: p.hourly_rate || 25,
          daily_rate: p.daily_rate || 180,
          weekly_rate: p.weekly_rate || 800,
          location: p.location || '',
          availability: p.availability || 'available',
          skills: p.skills || [],
          certifications: p.certifications || [],
          identity_verified: p.identity_verified || false,
          avatar_url: p.avatar_url || '',
          _id: p.id,
        });
      } else {
        setForm((prev) => ({ ...prev, full_name: me.full_name || '' }));
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    const data = { ...form, user_email: user.email };
    delete data._id;
    if (form._id) {
      await base44.entities.ServiceProvider.update(form._id, data);
    } else {
      const created = await base44.entities.ServiceProvider.create(data);
      setForm((prev) => ({ ...prev, _id: created.id }));
      setIsProvider(true);
    }
    toast.success(t('profile_saved'));
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, avatar_url: file_url }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const addCert = () => {
    if (newCert.trim() && !form.certifications.includes(newCert.trim())) {
      setForm((prev) => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
      setNewCert('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('my_profile')}</h1>
          <p className="text-muted-foreground mt-1">{isProvider ? t('manage_profile') : t('setup_profile')}</p>
        </div>
        {isProvider && (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {t('provider_badge')}
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> {t('basic_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{form.full_name?.[0] || '?'}</span>
                )}
              </div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild><span>{t('upload_photo')}</span></Button>
              </Label>
              <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('full_name')}</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('category')}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{t(`cat_${cat}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('bio')}</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder={t('bio_placeholder')} className="mt-1.5" rows={4} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('location')}</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t('location_placeholder')} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('years_exp')}</Label>
                <Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label>{t('availability_label')}</Label>
              <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                <SelectTrigger className="mt-1.5 w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t('available_status')}</SelectItem>
                  <SelectItem value="busy">{t('busy')}</SelectItem>
                  <SelectItem value="offline">{t('offline')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-primary" /> {t('rates_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>{t('hourly_rate')}</Label>
                <Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('daily_rate')}</Label>
                <Input type="number" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: parseFloat(e.target.value) || 0 })} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('weekly_rate')}</Label>
                <Input type="number" value={form.weekly_rate} onChange={(e) => setForm({ ...form, weekly_rate: parseFloat(e.target.value) || 0 })} className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{t('skills')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button onClick={() => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) })} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder={t('add_skill')} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
              <Button variant="outline" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{t('certifications')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.certifications.map((cert, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1 bg-primary/5">
                  {cert}
                  <button onClick={() => setForm({ ...form, certifications: form.certifications.filter((_, idx) => idx !== i) })} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder={t('add_cert')} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())} />
              <Button variant="outline" onClick={addCert}><Plus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-full gap-2">
          <Save className="w-5 h-5" /> {isProvider ? t('save') : t('create_profile')}
        </Button>
      </div>
    </div>
  );
}