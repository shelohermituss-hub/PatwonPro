import type { TeamMember } from "@/types/admin";

export const MOCK_TEAM: TeamMember[] = [
  { id: "adm-001", name: "Shelo Hermitus", email: "shelo@jereboutik.com", role: "super_admin", active: true, lastLoginAt: "2026-09-05T11:00:00Z" },
  { id: "adm-002", name: "Nadine Baptiste", email: "nadine@jereboutik.com", role: "finance_agent", active: true, lastLoginAt: "2026-09-05T08:30:00Z" },
  { id: "adm-003", name: "Carl Édouard", email: "carl@jereboutik.com", role: "sales_agent", active: true, lastLoginAt: "2026-09-05T09:10:00Z" },
  { id: "adm-004", name: "Marie Joseph", email: "marie.j@jereboutik.com", role: "field_agent", active: true, lastLoginAt: "2026-09-04T17:00:00Z" },
  { id: "adm-005", name: "Wideline Pierre", email: "wideline@jereboutik.com", role: "support_agent", active: true, lastLoginAt: "2026-09-05T10:00:00Z" },
  { id: "adm-006", name: "Jean-Robert Louis", email: "jr@jereboutik.com", role: "operations_manager", active: true, lastLoginAt: "2026-09-03T15:00:00Z" },
  { id: "adm-007", name: "Stéphanie Volcy", email: "stephanie@jereboutik.com", role: "read_only", active: false, lastLoginAt: "2026-07-20T12:00:00Z" },
];
