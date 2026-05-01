import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Plus, X, Save, ShieldCheck, Zap, Upload, MapPin, CalendarDays, Search, Clock, Trash2 } from 'lucide-react';
// Upload still used for avatar
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { CATEGORIES, COUNTRY_SETTINGS } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';
import LocationPicker from '@/components/location/LocationPicker';
import IdentityVerification from '@/components/verification/IdentityVerification';
import DocumentUploadSection from '@/components/providers/DocumentUploadSection';
import DoctorAvailabilityCalendar from '@/components/doctors/DoctorAvailabilityCalendar';

export default function MyProfile() {
  const { t } = useI18n();
  const { user, profile: userProfile, refetch: refetchUserProfile } = useUserProfile();
  const [existingProvider, setExistingProvider] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', categories: [], bio: '',
    experience_years: 0, hourly_rate: 25, daily_rate: 180, weekly_rate: 800,
    consultation_fee: 0,
    location_text: '', latitude: null, longitude: null,
    availability: 'available', skills: [], certifications: [],
    avatar_url: '', id_document_url: '',
  });

  const isClient = !userProfile?.role || userProfile?.role === 'client' || userProfile?.role === 'both';
  const isProvider = (userProfile?.role === 'provider' || userProfile?.role === 'both') && !!existingProvider;
  const country = userProfile?.country || 'brazil';
  const countryInfo = COUNTRY_SETTINGS[country] || COUNTRY_SETTINGS.brazil;
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (userProfile?.company_name) {
      setCompanyName(userProfile.company_name);
    }
    if (userProfile?.position) {
      setPosition(userProfile.position);
    }
  }, [userProfile?.company_name, userProfile?.position]);

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
          consultation_fee: p.consultation_fee || 0,
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
    toast.success(t('photo_uploaded'));
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    // Delete associated provider profile if exists
    if (existingProvider) {
      await base44.entities.ServiceProvider.delete(existingProvider.id);
    }
    // Delete user profile
    if (userProfile) {
      await base44.entities.UserProfile.delete(userProfile.id);
    }
    toast.success(t('account_deleted'));
    setTimeout(() => base44.auth.logout(), 1500);
  };

  const addCert = () => {
    if (newCert.trim() && !form.certifications.includes(newCert.trim())) {
      setForm(f => ({ ...f, certifications: [...f.certifications, newCert.trim()] }));
      setNewCert('');
    }
  };

  return (
    <div className="bg-white light" style={{ colorScheme: 'light' }}>
      {/* Hero */}
      <div className="h-20 sm:h-32 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100" />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('my_profile')}</h1>
        <div className="flex flex-wrap gap-2">
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
        <Card className="mb-4 sm:mb-6 border border-gray-100 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-3">{t('role_on_platform')}</p>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
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
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border-2 text-xs sm:text-sm font-medium transition-all ${
                  isClient
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >
                <Search className="w-4 h-4" /> {t('client_label')}
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
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border-2 text-xs sm:text-sm font-medium transition-all ${
                  isProvider
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                <Briefcase className="w-4 h-4" /> {t('provider_label')}
                {isProvider && <span className="text-xs bg-green-500 text-white rounded-full px-1.5 py-0.5 leading-none">✓</span>}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {isClient && userProfile && (
        <Card className="mb-4 sm:mb-6 border border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-800"><Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> {t('business_profile')}</CardTitle></CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="company_name">{t('company_name_label')}</Label>
              <p className="text-xs text-gray-500 mb-2">{t('company_name_desc')}</p>
              <Input
                id="company_name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder={t('company_name_placeholder')}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-400 mt-2">{t('company_identity_note')}</p>
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <p className="text-xs text-gray-500 mb-2">Your job title or position at the company</p>
              <Input
                id="position"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="e.g., Manager, Director, Founder"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="company_logo">{t('company_logo_label')}</Label>
              <p className="text-xs text-gray-500 mb-2">{t('company_logo_desc')}</p>
              <div className="flex items-center gap-4">
                {userProfile?.company_logo_url ? (
                  <img src={userProfile.company_logo_url} alt="Company logo" className="w-16 h-16 rounded object-cover border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">{t('optional')}</div>
                )}
                <Label htmlFor="company_logo" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="gap-2" asChild><span><Upload className="w-3.5 h-3.5" /> {t('upload_logo')}</span></Button>
                  <input 
                    id="company_logo" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      await base44.entities.UserProfile.update(userProfile.id, { company_logo_url: file_url });
                      await refetchUserProfile();
                      toast.success(t('logo_uploaded'));
                    }}
                  />
                </Label>
              </div>
            </div>
            <Button
              onClick={async () => {
                await base44.entities.UserProfile.update(userProfile.id, { company_name: companyName, position });
                await refetchUserProfile();
                toast.success(t('business_updated'));
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" /> {t('save_business_name')}
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
                {t('profile_incomplete_warning')}
              </CardContent>
            </Card>
          )}

          {/* Basic Info with image */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500" />
            <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-800"><User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> {t('basic_info')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : <span className="text-lg sm:text-2xl font-bold text-blue-600">{form.full_name?.[0] || '?'}</span>}
                </div>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="gap-2" asChild><span><Upload className="w-3.5 h-3.5" /> {t('upload_photo')}</span></Button>
                  </Label>
                  <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
                  <p className="text-xs text-gray-400 mt-1">{t('required_for_visibility')}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                 <div>
                   <Label className="text-sm">{t('full_name')} *</Label>
                  <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t('phone_label')} *</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" className="mt-1.5" />
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">{t('category')} * ({t('category_up_to_6')})</Label>
                <p className="text-xs text-gray-500 mb-2">{t('category_select_desc')}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                      className={`px-2.5 sm:px-3 py-1.5 rounded-full border-2 text-xs sm:text-sm font-medium transition-all ${
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
                <Input type="number" value={form.experience_years || ''} onChange={e => {const val = e.target.value; setForm(f => ({ ...f, experience_years: val === '' ? 0 : parseInt(val) || 0 }));}} className="mt-1.5" />
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

          {/* Rates — only for non-doctors */}
          {!form.categories.includes('doctor') && (
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-500" />
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><Briefcase className="w-5 h-5 text-blue-600" /> {t('rates_title')} ({countryInfo?.symbol || '$'})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><Label>{t('hourly_rate')}</Label><Input type="number" value={form.hourly_rate} onChange={e => {const val = e.target.value; setForm(f => ({ ...f, hourly_rate: val === '' ? '' : parseFloat(val) || 0 }));}} className="mt-1.5" /></div>
                  <div><Label>{t('daily_rate')}</Label><Input type="number" value={form.daily_rate} onChange={e => {const val = e.target.value; setForm(f => ({ ...f, daily_rate: val === '' ? '' : parseFloat(val) || 0 }));}} className="mt-1.5" /></div>
                  <div><Label>{t('weekly_rate')}</Label><Input type="number" value={form.weekly_rate} onChange={e => {const val = e.target.value; setForm(f => ({ ...f, weekly_rate: val === '' ? '' : parseFloat(val) || 0 }));}} className="mt-1.5" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultation Fee — only for doctors */}
          {form.categories.includes('doctor') && (
            <Card className="border border-blue-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-500" />
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><Briefcase className="w-5 h-5 text-blue-600" /> {t('consultation_fee_title')} ({countryInfo?.symbol || '$'})</CardTitle></CardHeader>
              <CardContent>
                <div>
                  <Label>{t('consultation_fee_label')}</Label>
                  <p className="text-xs text-gray-500 mb-2">{t('consultation_fee_desc')}</p>
                  <Input type="number" value={form.consultation_fee} onChange={e => {const val = e.target.value; setForm(f => ({ ...f, consultation_fee: val === '' ? '' : parseFloat(val) || 0 }));}} placeholder={t('consultation_fee_placeholder')} className="mt-1.5" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills with image */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500" />
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
            <div className="h-2 bg-gradient-to-r from-green-600 to-teal-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <ShieldCheck className="w-5 h-5 text-green-600" /> {t('identity_verification')}
              </CardTitle>
              <p className="text-sm text-gray-500">{t('identity_verification_desc')}</p>
            </CardHeader>
            <CardContent>
              {existingProvider && user ? (
                <IdentityVerification
                  provider={existingProvider}
                  country={country}
                  onUpdated={() => user?.email && base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => list[0] && setExistingProvider(list[0]))}
                />
              ) : (
                <p className="text-sm text-gray-400">{t('save_profile_first')}</p>
              )}
            </CardContent>
          </Card>

          {/* Documents & Portfolio */}
          {existingProvider && (
            <DocumentUploadSection providerId={existingProvider.id} userEmail={user?.email} />
          )}

          <Button onClick={handleSave} size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-11 sm:h-12 text-sm sm:text-base">
             <Save className="w-4 sm:w-5 h-4 sm:h-5" /> {existingProvider ? t('save') : t('create_profile')}
           </Button>

          {/* Availability Calendar — for doctors only after profile exists */}
          {existingProvider && form.categories.includes('doctor') && (
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                  <CalendarDays className="w-5 h-5 text-blue-600" /> {t('consultation_availability')}
                </CardTitle>
                <p className="text-sm text-gray-500">{t('consultation_availability_desc')}</p>
              </CardHeader>
              <CardContent>
                <DoctorAvailabilityCalendar 
                  provider={existingProvider} 
                  isOwnProfile={true}
                  userEmail={user?.email}
                />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-700 mb-1">{t('setup_as_client')}</p>
              <p className="text-sm">{t('setup_as_client_desc')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Danger Zone — always at the bottom */}
      <Card className="border border-red-100 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-700">
            <Trash2 className="w-4 h-4" /> {t('danger_zone')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">{t('danger_zone_desc')}</p>
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 gap-2"
              onClick={() => { setShowDeleteConfirm(true); setDeleteConfirmText(''); }}
            >
              <Trash2 className="w-4 h-4" /> {t('delete_account')}
            </Button>
          ) : (
            <div className="space-y-3 max-w-sm">
              <p className="text-sm text-red-600 font-medium">{t('type_to_confirm')} <span className="font-mono bg-red-50 px-1 rounded">deletemyaccount</span> {t('type_to_confirm2')}</p>
              <Input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="deletemyaccount"
                className="border-red-200 focus:border-red-400"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={deleteConfirmText !== 'deletemyaccount' || deletingAccount}
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletingAccount ? t('deleting') : t('confirm_delete')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      </div>
    </div>
  );
}