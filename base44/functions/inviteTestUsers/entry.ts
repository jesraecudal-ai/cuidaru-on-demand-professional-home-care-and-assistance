import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admin can invite test users
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { users } = body; // Array of {email, role}

    if (!Array.isArray(users) || users.length === 0) {
      return Response.json({ error: 'Provide users array with email and role' }, { status: 400 });
    }

    const results = [];
    for (const testUser of users) {
      try {
        await base44.users.inviteUser(testUser.email, testUser.role);
        results.push({ email: testUser.email, role: testUser.role, status: 'invited' });
      } catch (error) {
        results.push({ email: testUser.email, role: testUser.role, status: 'failed', error: error.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});