import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Plus, X, Save, ShieldCheck, Zap, Upload, MapPin, CalendarDays, Search } from 'lucide-react';
// Upload still used for avatar
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { CATEGORIES, COUNTRY_SETTINGS } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';
import AvailabilityCalendar from '@/components/availability/AvailabilityCalendar';
import LocationPicker from '@/components/location/LocationPicker';
import IdentityVerification from '@/components/verification/IdentityVerification';
import DocumentUploadSection from '@/components/providers/DocumentUploadSection';

export default function MyProfile() {
  const { t } = useI18n();
  const { user, profile: userProfile, refetch: refetchUserProfile } = useUserProfile();
  const [existingProvider, setExistingProvider] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', categories: [], bio: '',
    experience_years: 0, hourly_rate: 25, daily_rate: 180, weekly_rate: 800,
    location_text: '', latitude: null, longitude: null,
    availability: 'available', skills: [], certifications: [],
    avatar_url: '', id_document_url: '',
  });

  const isClient = !userProfile?.role || userProfile?.role === 'client' || userProfile?.role === 'both';
  const isProvider = userProfile?.role === 'provider' || userProfile?.role === 'both' || !!existingProvider;
  const country = userProfile?.country || 'brazil';
  const countryInfo = COUNTRY_SETTINGS[country] || COUNTRY_SETTINGS.brazil;
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (userProfile?.company_name) {
      setCompanyName(userProfile.company_name);
    }
  }, [userProfile?.company_name]);

  useEffect(() => {
    if (!user) return;
    base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) {
        const p = list[0];
        setExistingProvider(p);
        setForm({
          full_name: p.full_name || user.full_name || '',
          phone: p.phone || '',
          categories: p.categories || [],
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

  const checkProfileComplete = (data) => {
    return !!(data.avatar_url && data.full_name && data.phone && data.categories?.length > 0 && data.location_text);
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
    <div className="bg-white">
      {/* Hero with background image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=300&fit=crop" 
          alt="Professional healthcare" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-700/80" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('my_profile')}</h1>
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

      {/* Role toggle */}
      {userProfile && (
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-600 mb-3">I am on CareBook as:</p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={async () => {
                  const currentRole = userProfile.role;
                  let newRole;
                  if (currentRole === 'client') newRole = 'client'; // already only client, no-op
                  else if (currentRole === 'provider') newRole = 'both';
                  else if (currentRole === 'both') newRole = 'provider'; // toggle off client
                  else newRole = 'client';
                  await base44.entities.UserProfile.update(userProfile.id, { role: newRole });
                  await refetchUserProfile();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  isClient
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >
                <Search className="w-4 h-4" /> Client
                {isClient && <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 leading-none">✓</span>}
              </button>
              <button
                onClick={async () => {
                  const currentRole = userProfile.role;
                  let newRole;
                  if (currentRole === 'provider') newRole = 'provider'; // already only provider, no-op
                  else if (currentRole === 'client') newRole = 'both';
                  else if (currentRole === 'both') newRole = 'client'; // toggle off provider
                  else newRole = 'provider';
                  await base44.entities.UserProfile.update(userProfile.id, { role: newRole });
                  await refetchUserProfile();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  isProvider
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Provider
                {isProvider && <span className="text-xs bg-green-500 text-white rounded-full px-1.5 py-0.5 leading-none">✓</span>}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {isClient && (
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><Briefcase className="w-5 h-5 text-blue-600" /> Business Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name (Optional)</Label>
              <p className="text-xs text-gray-500 mb-2">Display your company or business name instead of your personal name</p>
              <Input
                id="company_name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Healthcare Services"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-400 mt-2">Your verified identity is always kept on file for security</p>
            </div>
            <Button
              onClick={async () => {
                await base44.entities.UserProfile.update(userProfile.id, { company_name: companyName });
                await refetchUserProfile();
                toast.success('Business profile updated!');
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" /> Save Business Name
            </Button>
          </CardContent>
        </Card>
      )}

      {isProvider ? (
        <div className="space-y-6">
          {/* Profile completeness */}
          {existingProvider && !existingProvider.profile_complete && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-800">
                ⚠️ Complete your profile to appear in search results. Required: Photo, Name, Phone, Categories, and Location.
              </CardContent>
            </Card>
          )}

          {/* Basic Info with image */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1631217314830-e63c9a1c5b44?w=600&h=200&fit=crop" 
                alt="Healthcare professional" 
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/60 to-blue-500/60" />
            </div>
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

              <div>
                <Label>{t('category')} * (up to 6)</Label>
                <p className="text-xs text-gray-500 mb-2">Select the services you offer</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          categories: f.categories.includes(cat.key)
                            ? f.categories.filter(c => c !== cat.key)
                            : f.categories.length < 6 ? [...f.categories, cat.key] : f.categories
                        }));
                      }}
                      disabled={!form.categories.includes(cat.key) && form.categories.length >= 6}
                      className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                        form.categories.includes(cat.key)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {cat.icon} {t(`cat_${cat.key}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t('years_exp')}</Label>
                <Input type="number" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))} className="mt-1.5" />
              </div>

              <div>
                <Label>{t('bio')}</Label>
                <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder={t('bio_placeholder')} className="mt-1.5" rows={3} />
              </div>

              {/* Location */}
              <div>
                <Label className="flex items-center gap-1 mb-2"><MapPin className="w-3.5 h-3.5" />{t('location')} *</Label>
                <LocationPicker
                  country={country}
                  locationText={form.location_text}
                  latitude={form.latitude}
                  longitude={form.longitude}
                  onChange={({ location_text, latitude, longitude }) =>
                    setForm(f => ({ ...f, location_text, latitude, longitude }))
                  }
                />
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

          {/* Rates with image */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-purple-400 to-pink-500 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1579154204601-01d82b944c47?w=600&h=200&fit=crop" 
                alt="Healthcare pricing" 
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/60 to-pink-500/60" />
            </div>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><Briefcase className="w-5 h-5 text-blue-600" /> {t('rates_title')} ({countryInfo.symbol})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><Label>{t('hourly_rate')}</Label><Input type="number" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: parseFloat(e.target.value) || 0 }))} className="mt-1.5" /></div>
                <div><Label>{t('daily_rate')}</Label><Input type="number" value={form.daily_rate} onChange={e => setForm(f => ({ ...f, daily_rate: parseFloat(e.target.value) || 0 }))} className="mt-1.5" /></div>
                <div><Label>{t('weekly_rate')}</Label><Input type="number" value={form.weekly_rate} onChange={e => setForm(f => ({ ...f, weekly_rate: parseFloat(e.target.value) || 0 }))} className="mt-1.5" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Skills with image */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=200&fit=crop" 
                alt="Professional skills" 
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/60 to-red-500/60" />
            </div>
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

          {/* ID Verification with image */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-green-600 to-teal-500 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-86c54dcb98fe?w=600&h=200&fit=crop" 
                alt="Security verification" 
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/60 to-teal-500/60" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <ShieldCheck className="w-5 h-5 text-green-600" /> Identity Verification
              </CardTitle>
              <p className="text-sm text-gray-500">Verify your identity to earn a trusted badge. Required documents vary by country.</p>
            </CardHeader>
            <CardContent>
              {existingProvider ? (
                <IdentityVerification
                  provider={existingProvider}
                  country={country}
                  onUpdated={() => base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => list[0] && setExistingProvider(list[0]))}
                />
              ) : (
                <p className="text-sm text-gray-400">Save your profile first, then you can upload your identity documents.</p>
              )}
            </CardContent>
          </Card>

          {/* Documents & Portfolio */}
          {existingProvider && (
            <DocumentUploadSection providerId={existingProvider.id} userEmail={user?.email} />
          )}

          <Button onClick={handleSave} size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-12">
            <Save className="w-5 h-5" /> {existingProvider ? t('save') : t('create_profile')}
          </Button>

          {/* Availability Calendar — only shown after profile exists */}
          {existingProvider && (
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-indigo-400 to-purple-500 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1579154204601-01d82b944c47?w=600&h=200&fit=crop" 
                  alt="Availability scheduling" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/60 to-purple-500/60" />
              </div>
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
      ) : (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700 mb-1">You're set up as a client</p>
            <p className="text-sm">Toggle "Provider" above to also offer your services on CareBook.</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}