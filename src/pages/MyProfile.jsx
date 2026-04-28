import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Plus, X, Save, ShieldCheck, Zap, Upload, MapPin, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { CATEGORIES, COUNTRY_SETTINGS } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';
import AvailabilityCalendar from '@/components/availability/AvailabilityCalendar';

export default function MyProfile() {
  const { t } = useI18n();
  const { user, profile: userProfile, refetch: refetchUserProfile } = useUserProfile();
  const [existingProvider, setExistingProvider] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: '', phone: '', category: 'caregiver', bio: '',
    experience_years: 0, hourly_rate: 25, daily_rate: 180, weekly_rate: 800,
    location_text: '', latitude: null, longitude: null,
    availability: 'available', skills: [], certifications: [],
    avatar_url: '', id_document_url: '',
  });

  const isProvider = userProfile?.role === 'provider' || userProfile?.role === 'both' || !!existingProvider;
  const country = userProfile?.country || 'brazil';
  const countryInfo = COUNTRY_SETTINGS[country] || COUNTRY_SETTINGS.brazil;

  useEffect(() => {
    if (!user) return;
    base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) {
        const p = list[0];
        setExistingProvider(p);
        setForm({
          full_name: p.full_name || user.full_name || '',
          phone: p.phone || '',
          category: p.category || 'caregiver',
          bio: p.bio || '',
          experience_years: p.experience_years || 0,
          hourly_rate: p.hourly_rate || 25,
          daily_rate: p.daily_rate || 180,
          weekly_rate: p.weekly_rate || 800,
          location_text: p.location_text || '',
          latitude: p.latitude || null,
          longitude: p.longitude || null,
          availability: p.availability || 'available',
          skills: p.skills || [],
          certifications: p.certifications || [],
          avatar_url: p.avatar_url || '',
          id_document_url: p.id_document_url || '',
        });
      } else {
        setForm(f => ({ ...f, full_name: user.full_name || '' }));
      }
    });
  }, [user]);

  const detectLocation = () => {
    setGeoLoading(true);
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      setGeoLoading(false);
      toast.success('Location detected!');
    }, () => { setGeoLoading(false); toast.error('Location access denied'); });
  };

  const checkProfileComplete = (data) => {
    return !!(data.avatar_url && data.full_name && data.phone && data.category && data.location_text);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      user_email: user.email,
      country,
      profile_complete: checkProfileComplete(form),
      verification_status: existingProvider?.verification_status || 'unverified',
    };
    if (existingProvider) {
      await base44.entities.ServiceProvider.update(existingProvider.id, data);
      setExistingProvider(p => ({ ...p, ...data }));
    } else {
      const created = await base44.entities.ServiceProvider.create(data);
      setExistingProvider(created);
    }
    toast.success(t('profile_saved'));
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, avatar_url: file_url }));
    toast.success('Photo uploaded!');
  };

  const handleUploadID = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, id_document_url: file_url }));
    // Update verification status to pending
    if (existingProvider) {
      await base44.entities.ServiceProvider.update(existingProvider.id, { id_document_url: file_url, verification_status: 'pending' });
    }
    toast.success('ID uploaded! Verification pending admin review.');
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const addCert = () => {
    if (newCert.trim() && !form.certifications.includes(newCert.trim())) {
      setForm(f => ({ ...f, certifications: [...f.certifications, newCert.trim()] }));
      setNewCert('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('my_profile')}</h1>
          <p className="text-gray-500 mt-1">{isProvider ? t('manage_profile') : t('setup_profile')}</p>
        </div>
        <div className="flex gap-2">
          {existingProvider?.is_premium && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1"><Zap className="w-3 h-3" /> Premium</Badge>
          )}
          {existingProvider?.verification_status === 'verified' && (
            <Badge className="bg-green-100 text-green-700 border-green-300 gap-1"><ShieldCheck className="w-3 h-3" /> Verified</Badge>
          )}
          {existingProvider?.verification_status === 'pending' && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">ID Pending</Badge>
          )}
        </div>
      </div>

      {!isProvider ? (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <p className="text-blue-800 font-medium mb-3">Want to offer your services too?</p>
            <p className="text-sm text-blue-700 mb-4">Set up a provider profile to get hired and earn money through CareBook.</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={async () => {
                if (userProfile) {
                  await base44.entities.UserProfile.update(userProfile.id, { role: 'both' });
                  await refetchUserProfile();
                }
              }}
            >
              <Briefcase className="w-4 h-4" /> Become a Provider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Profile completeness */}
          {existingProvider && !existingProvider.profile_complete && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-800">
                ⚠️ Complete your profile to appear in search results. Required: Photo, Name, Phone, Category, and Location.
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><User className="w-5 h-5 text-blue-600" /> {t('basic_info')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : <span className="text-2xl font-bold text-blue-600">{form.full_name?.[0] || '?'}</span>}
                </div>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="gap-2" asChild><span><Upload className="w-3.5 h-3.5" /> {t('upload_photo')}</span></Button>
                  </Label>
                  <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                  <p className="text-xs text-gray-400 mt-1">Required for profile visibility</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('full_name')} *</Label>
                  <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="mt-1.5" />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" className="mt-1.5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('category')} *</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat.key} value={cat.key}>{cat.icon} {t(`cat_${cat.key}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('years_exp')}</Label>
                  <Input type="number" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))} className="mt-1.5" />
                </div>
              </div>

              <div>
                <Label>{t('bio')}</Label>
                <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder={t('bio_placeholder')} className="mt-1.5" rows={3} />
              </div>

              {/* Location */}
              <div>
                <Label><MapPin className="inline w-3.5 h-3.5 mr-1" />{t('location')} *</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input value={form.location_text} onChange={e => setForm(f => ({ ...f, location_text: e.target.value }))} placeholder={t('location_placeholder')} />
                  <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={geoLoading} className="whitespace-nowrap">
                    {geoLoading ? 'Getting...' : '📍 GPS'}
                  </Button>
                </div>
                {form.latitude && <p className="text-xs text-green-600 mt-1">✓ GPS coordinates saved for distance matching</p>}
              </div>

              <div>
                <Label>{t('availability_label')}</Label>
                <Select value={form.availability} onValueChange={v => setForm(f => ({ ...f, availability: v }))}>
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
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><Briefcase className="w-5 h-5 text-blue-600" /> {t('rates_title')} ({countryInfo.symbol})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><Label>{t('hourly_rate')}</Label><Input type="number" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: parseFloat(e.target.value) || 0 }))} className="mt-1.5" /></div>
                <div><Label>{t('daily_rate')}</Label><Input type="number" value={form.daily_rate} onChange={e => setForm(f => ({ ...f, daily_rate: parseFloat(e.target.value) || 0 }))} className="mt-1.5" /></div>
                <div><Label>{t('weekly_rate')}</Label><Input type="number" value={form.weekly_rate} onChange={e => setForm(f => ({ ...f, weekly_rate: parseFloat(e.target.value) || 0 }))} className="mt-1.5" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle className="text-lg text-gray-800">{t('skills')}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.skills.map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">{s}
                    <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }))} className="ml-1"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder={t('add_skill')} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <Button variant="outline" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle className="text-lg text-gray-800">{t('certifications')}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.certifications.map((c, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 pr-1">{c}
                    <button onClick={() => setForm(f => ({ ...f, certifications: f.certifications.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newCert} onChange={e => setNewCert(e.target.value)} placeholder={t('add_cert')} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} />
                <Button variant="outline" onClick={addCert}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* ID Verification */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><ShieldCheck className="w-5 h-5 text-green-600" /> Identity Verification</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">Upload a government-issued ID. Admin will review and approve within 24h. Verified providers get a badge and build more trust.</p>
              <div className="flex items-center gap-4">
                {existingProvider?.verification_status === 'verified' && <Badge className="bg-green-100 text-green-700 border-green-300"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified</Badge>}
                {existingProvider?.verification_status === 'pending' && <Badge variant="outline" className="text-amber-600 border-amber-300">Under Review</Badge>}
                {(!existingProvider?.verification_status || existingProvider?.verification_status === 'unverified') && (
                  <Label htmlFor="id_doc" className="cursor-pointer">
                    <Button variant="outline" className="gap-2" asChild><span><Upload className="w-4 h-4" /> Upload ID Document</span></Button>
                  </Label>
                )}
                <input id="id_doc" type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadID} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-12">
            <Save className="w-5 h-5" /> {existingProvider ? t('save') : t('create_profile')}
          </Button>

          {/* Availability Calendar — only shown after profile exists */}
          {existingProvider && (
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                  <CalendarDays className="w-5 h-5 text-blue-600" /> Availability & Schedule
                </CardTitle>
                <p className="text-sm text-gray-500">Set your working days, hours, and block specific dates. Clients will see your real-time availability when booking.</p>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar providerId={existingProvider.id} userEmail={user?.email} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}