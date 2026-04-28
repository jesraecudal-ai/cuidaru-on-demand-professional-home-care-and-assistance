import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch (e) {}
      setLoading(false);
    };
    init();
  }, []);

  const refetch = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (e) {}
  };

  return { user, profile, loading, refetch };
}