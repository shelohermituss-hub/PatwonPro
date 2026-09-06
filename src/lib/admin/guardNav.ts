import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { canSeeNav, type AdminNavId } from "@/lib/admin/permissions";

/**
 * Per-page access guard for `/admin/*` routes. `(admin)/layout.tsx`
 * only checks "is this an admin at all" — without this, any admin
 * sub-role can reach a page by direct URL even when `canSeeNav()` says
 * their nav shouldn't show it (SELECT policies are `is_platform_admin()`
 * only, not role-scoped, so the data would render). Call at the top of
 * every non-dashboard admin page.tsx.
 */
export async function requireNavAccess(nav: AdminNavId) {
  const profile = await getCurrentProfile();
  if (!profile || !isPlatformAdmin(profile) || !canSeeNav(profile.admin_role ?? "read_only", nav)) {
    redirect("/admin");
  }
}
