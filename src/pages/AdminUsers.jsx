import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { Users, Search, AlertTriangle, CheckCircle2, Ban, Star, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function UserRow({ profile, provider, onToggle }) {
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
          {isPremium && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Premium</Badge>}
          {isVerified && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Verified</Badge>}
          {isDisabled && <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Disabled</Badge>}
          {profile?.country && <Badge variant="outline" className="text-xs capitalize">{profile.country}</Badge>}
        </div>
      </div>

      <Button
        size="sm"
        variant={isDisabled ? 'outline' : 'destructive'}
        className={isDisabled ? 'border-green-400 text-green-700 hover:bg-green-50 gap-1.5' : 'gap-1.5'}
        onClick={() => onToggle(profile, provider, !isDisabled)}
      >
        {isDisabled ? <><Eye className="w-3.5 h-3.5" /> Enable</> : <><EyeOff className="w-3.5 h-3.5" /> Disable</>}
      </Button>
    </div>
  );
}

export default function AdminUsers() {
  const { user } = useUserProfile();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-500">Only administrators can manage users.</p>
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
    toast.success(enable ? 'User enabled.' : 'User disabled.');
    queryClient.invalidateQueries({ queryKey: ['admin-user-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-providers'] });
  };

  const isLoading = loadingProfiles || loadingProviders;
  const disabledCount = profiles.filter(p => p.is_active === false).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-600" /> User Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">{profiles.length} total users · {disabledCount} disabled</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email…"
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
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="provider">Provider</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ profile, provider }) => (
            <UserRow
              key={profile.id}
              profile={profile}
              provider={provider}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}