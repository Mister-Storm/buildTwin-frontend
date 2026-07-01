"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Users,
  ToggleLeft,
  ToggleRight,
  LogOut,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  isAuthenticated,
  getStoredUser,
  logout,
  listUsers,
  createUser,
  toggleUserActive,
} from "@/services/auth.service";

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  active: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const currentUser = getStoredUser();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRoles, setNewRoles] = useState("USER");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadUsers();
  }, [router]);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(
        data.map((u) => ({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          roles: u.roles,
          active: u.active ?? true,
        })) as UserRow[],
      );
    } catch {
      // silently fail — user may not have ADMIN role
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser({
        email: newEmail,
        password: newPassword,
        displayName: newName,
        roles: newRoles.split(",").map((r) => r.trim()),
      });
      setShowCreate(false);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      await loadUsers();
    } catch {
      // ignore
    }
  }

  async function handleToggleActive(userId: string) {
    await toggleUserActive(userId);
    await loadUsers();
  }

  return (
    <AppShell breadcrumbs={[{ label: "Administração" }]}>
      <div className="space-y-8">
        <PageHeader
          title="Administração"
          description="Gerenciamento de usuários, papéis e permissões"
          actions={
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          }
        />

        {/* Current user info */}
        {currentUser && (
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-accent/15">
                <Building2 className="size-5 text-brand-accent" />
              </div>
              <div>
                <p className="font-semibold">{currentUser.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.email} &middot;{" "}
                  {currentUser.roles.join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="size-5" />
              Usuários
            </h3>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Novo Usuário
            </button>
          </div>

          {/* Create user form */}
          {showCreate && (
            <form
              onSubmit={handleCreate}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent"
                />
                <input
                  type="text"
                  placeholder="Nome exibido"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Papéis (USER, ADMIN)"
                    value={newRoles}
                    onChange={(e) => setNewRoles(e.target.value)}
                    className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-brand-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Users list */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <span className="inline-block size-5 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
              <span className="ml-2 text-sm">Carregando...</span>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Papéis
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Ativo
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.displayName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center rounded-full bg-brand-accent/10 px-2 py-0.5 text-xs font-medium text-brand-accent"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.active ? (
                          <span className="text-xs font-medium text-green-500">
                            Ativo
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-red-400">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user.id)}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            title={user.active ? "Desativar" : "Ativar"}
                          >
                            {user.active ? (
                              <ToggleRight className="size-4" />
                            ) : (
                              <ToggleLeft className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          As permissões de endpoint são controladas pela tabela{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-brand-accent">
            buildtwin_role_permission
          </code>{" "}
          no banco de dados. Configure pela API{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            POST /api/v1/admin/roles/:id/permissions
          </code>
          .
        </p>
      </div>
    </AppShell>
  );
}
