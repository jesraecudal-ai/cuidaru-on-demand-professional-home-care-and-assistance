import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { Users, Search, AlertTriangle, CheckCircle2, Ban, Star, ShieldCheck, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

function UserRow({ profile, provider, onToggle, onDelete, onEdit }) {
  const { t } = useI18n();
  const isDisabled = profile?.is_active === false || provider?.is_active === false;
  const isPremium = profile?.is_premium || provider?.is_premium;
  const isVerified = provider?.verification_status === 'verified';
  const name = provider?.full_name || profile?.user_email || '—';
  const email = profile?.user_email;
  const role = profile?.role || '—';

  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${isDisabled ? 'opacity-50 border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0 overflow-hidden">
        {provider?.avatar_url
          ? <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" />
          : name[0]?.toUpperCase()
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">{email}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline" className="text-xs capitalize">{role}</Badge>
          {isPremium && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">{t('premium')}</Badge>}
          {isVerified && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">{t('verified')}</Badge>}
          {isDisabled && <Badge className="text-xs bg-red-100 text-red-700 border-red-200">{t('disabled')}</Badge>}
          {profile?.country && <Badge variant="outline" className="text-xs capitalize">{profile.country}</Badge>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => onEdit(profile, provider)}
        >
          <Edit className="w-3.5 h-3.5" /> {t('edit')}
        </Button>
        <Button
          size="sm"
          variant={isDisabled ? 'outline' : 'destructive'}
          className={isDisabled ? 'border-green-400 text-green-700 hover:bg-green-50 gap-1.5' : 'gap-1.5'}
          onClick={() => onToggle(profile, provider, !isDisabled)}
        >
          {isDisabled ? <><Eye className="w-3.5 h-3.5" /> {t('enable')}</> : <><EyeOff className="w-3.5 h-3.5" /> {t('disable_user')}</>}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1.5"
          onClick={() => {
            if (confirm(`Delete ${name}? This cannot be undone.`)) {
              onDelete(profile, provider);
            }
          }}
        >
          <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { t } = useI18n();
  const { user } = useUserProfile();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProfile, setEditingProfile] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['admin-user-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    enabled: isAdmin,
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ['admin-all-providers'],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 200),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('access_restricted')}</h2>
        <p className="text-gray-500">{t('admin_only_users')}</p>
      </div>
    );
  }

  // Merge profiles with their provider record (if any)
  const providerMap = {};
  providers.forEach(p => { providerMap[p.user_email] = p; });

  let rows = profiles.map(profile => ({
    profile,
    provider: providerMap[profile.user_email] || null,
  }));

  // Filters
  if (roleFilter !== 'all') {
    rows = rows.filter(r => r.profile.role === roleFilter);
  }
  if (statusFilter === 'active') {
    rows = rows.filter(r => r.profile.is_active !== false && (r.provider ? r.provider.is_active !== false : true));
  } else if (statusFilter === 'disabled') {
    rows = rows.filter(r => r.profile.is_active === false || r.provider?.is_active === false);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    rows = rows.filter(r =>
      r.profile.user_email?.toLowerCase().includes(q) ||
      r.provider?.full_name?.toLowerCase().includes(q)
    );
  }

  const handleToggle = async (profile, provider, enable) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { is_active: enable });
    }
    if (provider) {
      await base44.entities.ServiceProvider.update(provider.id, { is_active: enable });
    }
    toast.success(enable ? t('user_enabled_toast') : t('user_disabled_toast'));
    queryClient.invalidateQueries({ queryKey: ['admin-user-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-providers'] });
  };

  const handleDelete = async (profile, provider) => {
    if (profile) {
      await base44.entities.UserProfile.delete(profile.id);
    }
    if (provider) {
      await base44.entities.ServiceProvider.delete(provider.id);
    }
    toast.success(t('user_deleted_toast'));
    queryClient.invalidateQueries({ queryKey: ['admin-user-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-providers'] });
  };

  const handleEdit = (profile, provider) => {
    setEditingProfile(profile);
    setEditingProvider(provider);
    setEditFormData({
      profile: { ...profile },
      provider: { ...provider }
    });
  };

  const handleSaveEdit = async () => {
    if (editingProfile) {
      await base44.entities.UserProfile.update(editingProfile.id, editFormData.profile);
    }
    if (editingProvider) {
      await base44.entities.ServiceProvider.update(editingProvider.id, editFormData.provider);
    }
    toast.success(t('changes_saved'));
    setEditingProfile(null);
    setEditingProvider(null);
    queryClient.invalidateQueries({ queryKey: ['admin-user-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-providers'] });
  };

  const isLoading = loadingProfiles || loadingProviders;
  const disabledCount = profiles.filter(p => p.is_active === false).length;
  
  // Find orphaned providers (no matching user profile)
  const profileEmails = new Set(profiles.map(p => p.user_email));
  const orphanedProviders = providers.filter(p => !profileEmails.has(p.user_email));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-600" /> {t('user_management')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{profiles.length} {t('total_users')} · {disabledCount} {t('disabled')} · {orphanedProviders.length} orphaned providers</p>
      </div>

      {/* Orphaned Providers Alert */}
      {orphanedProviders.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Orphaned Providers ({orphanedProviders.length})</h3>
              <p className="text-sm text-amber-700 mb-3">These service providers don't have user profiles:</p>
              <div className="space-y-2">
                {orphanedProviders.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-amber-100">
                    <div>
                      <p className="font-medium text-gray-900">{p.full_name}</p>
                      <p className="text-xs text-gray-500">{p.user_email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete ${p.full_name}?`)) {
                          base44.entities.ServiceProvider.delete(p.id).then(() => {
                            toast.success('Provider deleted');
                            queryClient.invalidateQueries({ queryKey: ['admin-all-providers'] });
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('search_name_email')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_roles')}</SelectItem>
            <SelectItem value="client">{t('client_label')}</SelectItem>
            <SelectItem value="provider">{t('provider_label')}</SelectItem>
            <SelectItem value="both">{t('both')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="disabled">{t('disabled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('no_users_found')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ profile, provider }) => (
            <UserRow
              key={profile.id}
              profile={profile}
              provider={provider}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile || !!editingProvider} onOpenChange={(open) => { if (!open) { setEditingProfile(null); setEditingProvider(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('edit_user')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* UserProfile Fields */}
            {editingProfile && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-gray-900">User Profile</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <Select value={editFormData.profile?.role || 'client'} onValueChange={(value) => setEditFormData(prev => ({ ...prev, profile: { ...prev.profile, role: value } }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <Select value={editFormData.profile?.country || 'brazil'} onValueChange={(value) => setEditFormData(prev => ({ ...prev, profile: { ...prev.profile, country: value } }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brazil">Brazil</SelectItem>
                      <SelectItem value="uruguay">Uruguay</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="philippines">Philippines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <Input value={editFormData.profile?.company_name || ''} onChange={(e) => setEditFormData(prev => ({ ...prev, profile: { ...prev.profile, company_name: e.target.value } }))} />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editFormData.profile?.is_premium || false} onChange={(e) => setEditFormData(prev => ({ ...prev, profile: { ...prev.profile, is_premium: e.target.checked } }))} />
                    <span className="text-sm font-medium">Premium</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editFormData.profile?.is_active !== false} onChange={(e) => setEditFormData(prev => ({ ...prev, profile: { ...prev.profile, is_active: e.target.checked } }))} />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
            )}

            {/* ServiceProvider Fields */}
            {editingProvider && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Service Provider</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input value={editFormData.provider?.full_name || ''} onChange={(e) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, full_name: e.target.value } }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={editFormData.provider?.phone || ''} onChange={(e) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, phone: e.target.value } }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea className="w-full border rounded-md p-2 text-sm" rows="3" value={editFormData.provider?.bio || ''} onChange={(e) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, bio: e.target.value } }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <Input type="number" value={editFormData.provider?.hourly_rate || ''} onChange={(e) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, hourly_rate: e.target.value ? parseFloat(e.target.value) : null } }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                  <Select value={editFormData.provider?.verification_status || 'unverified'} onValueChange={(value) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, verification_status: value } }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unverified">Unverified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editFormData.provider?.is_premium || false} onChange={(e) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, is_premium: e.target.checked } }))} />
                    <span className="text-sm font-medium">Premium</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editFormData.provider?.is_active !== false} onChange={(e) => setEditFormData(prev => ({ ...prev, provider: { ...prev.provider, is_active: e.target.checked } }))} />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => { setEditingProfile(null); setEditingProvider(null); }}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}