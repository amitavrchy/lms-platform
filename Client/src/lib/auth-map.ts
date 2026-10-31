import type { AuthUser } from "./api";

export function mapAuthPayload(data: {
  user?: { id: string; email: string; name: string; avatarUrl?: string | null };
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string | null;
  role: AuthUser["role"];
  org?: { id: string; slug: string; name: string };
  organization?: { id: string; slug: string; name: string };
}): AuthUser {
  const user = data.user ?? {
    id: data.id!,
    email: data.email!,
    name: data.name!,
    avatarUrl: data.avatarUrl,
  };
  const org = data.org ?? data.organization!;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: data.role,
    orgId: org.id,
    orgSlug: org.slug,
    orgName: org.name,
  };
}
