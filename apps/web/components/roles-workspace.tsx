"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Plus, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { Button, DataTable, DoubleRule, Input, Select, StatusPill, type DataTableColumn } from "@ledgerline/ui";

const PERMISSION_AREAS = [
  "sales", "expenses", "banking", "accounting", 
  "payroll", "tax", "inventory", "reports", "team", "settings"
];

interface Role {
  id: string;
  name: string;
  isSystemRole: boolean;
  permissions: Record<string, { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; all?: boolean }>;
  memberCount: number;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  status: string;
}

export function RolesWorkspace({ initialTab }: { initialTab: "users" | "roles" }) {
  const [activeTab, setActiveTab] = useState<"users" | "roles">(initialTab);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // New role form state
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<Record<string, Record<string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === "roles") {
      void loadRoles();
    } else {
      void loadUsers();
      if (roles.length === 0) void loadRoles(); // users need roles for the dropdown
    }
  }, [activeTab]);

  async function loadRoles() {
    setIsLoadingRoles(true);
    try {
      const res = await fetch("/api/team/roles");
      const json = await res.json();
      setRoles(json.roles || []);
    } finally {
      setIsLoadingRoles(false);
    }
  }

  async function loadUsers() {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/team/users");
      const json = await res.json();
      setUsers(json.users || []);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleRoleChange(userId: string, newRoleId: string) {
    try {
      setUsers(users.map(u => u.id === userId ? { ...u, roleId: newRoleId } : u));
      await fetch(`/api/team/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId })
      });
      await loadUsers();
    } catch (e) {
      console.error(e);
      await loadUsers(); // revert
    }
  }

  async function handleDeleteRole(roleId: string) {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await fetch(`/api/team/roles/${roleId}`, { method: "DELETE" });
      await loadRoles();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/team/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName, permissions: newRolePerms })
      });
      if (res.ok) {
        setIsCreatingRole(false);
        setNewRoleName("");
        setNewRolePerms({});
        await loadRoles();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create role");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function togglePerm(area: string, action: string) {
    setNewRolePerms(prev => {
      const current = prev[area] || {};
      return {
        ...prev,
        [area]: { ...current, [action]: !current[action] }
      };
    });
  }

  const userColumns: DataTableColumn<UserRow>[] = [
    { key: "name", header: "Name", cell: (user) => (
      <div>
        <p className="font-medium text-ink-900">{user.name}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
      </div>
    ) },
    { key: "role", header: "Role", cell: (user) => (
      <select 
        className="h-8 rounded-[6px] border border-slate-200 bg-white px-2 text-sm text-ink-900 outline-none focus:border-brass-500 focus:ring-1 focus:ring-brass-500"
        value={user.roleId}
        onChange={(e) => void handleRoleChange(user.id, e.target.value)}
      >
        {roles.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
    ) },
    { key: "status", header: "Status", cell: (user) => (
      <StatusPill tone={user.status === "ACTIVE" ? "success" : "neutral"}>
        {user.status}
      </StatusPill>
    ) }
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Team</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">
          Roles & Permissions
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Manage your organization's users and custom access levels.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${
            activeTab === "users" ? "border-brass-500 text-ink-900" : "border-transparent text-slate-500 hover:border-slate-300"
          }`}
        >
          <UsersRound className="h-4 w-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${
            activeTab === "roles" ? "border-brass-500 text-ink-900" : "border-transparent text-slate-500 hover:border-slate-300"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Roles
        </button>
      </div>

      {activeTab === "users" && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-ink-900">Users</h2>
            <Button variant="accent" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Invite user
            </Button>
          </div>
          {isLoadingUsers ? (
            <div className="flex min-h-48 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading users...
            </div>
          ) : (
            <DataTable columns={userColumns} data={users} getRowId={(u) => u.id} />
          )}
        </section>
      )}

      {activeTab === "roles" && (
        <section className="space-y-4">
          {!isCreatingRole ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-ink-900">Custom Roles</h2>
                <Button variant="accent" size="sm" onClick={() => setIsCreatingRole(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add role
                </Button>
              </div>

              {isLoadingRoles ? (
                <div className="flex min-h-48 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading roles...
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map(role => (
                    <div key={role.id} className="relative rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-ink-900 flex items-center gap-2">
                            {role.name}
                            {role.isSystemRole && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">System</span>
                            )}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">{role.memberCount} members assigned</p>
                        </div>
                        {!role.isSystemRole && role.memberCount === 0 && (
                          <button onClick={() => void handleDeleteRole(role.id)} className="text-slate-400 hover:text-red-600 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {role.permissions.all ? (
                          <p className="text-xs text-slate-600">Full administrative access</p>
                        ) : (
                          <p className="text-xs text-slate-600">Custom access to {Object.keys(role.permissions).length} areas</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[8px] border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 p-4 sm:px-6">
                <h3 className="text-lg font-semibold text-ink-900">Create new role</h3>
              </div>
              <form onSubmit={handleCreateRole} className="p-4 sm:p-6">
                <div className="mb-6 max-w-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                  <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} required placeholder="e.g. Data Entry" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-2 font-medium">Area</th>
                        <th className="pb-2 font-medium text-center w-24">View</th>
                        <th className="pb-2 font-medium text-center w-24">Create</th>
                        <th className="pb-2 font-medium text-center w-24">Edit</th>
                        <th className="pb-2 font-medium text-center w-24">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {PERMISSION_AREAS.map(area => {
                        const areaName = area.charAt(0).toUpperCase() + area.slice(1);
                        return (
                          <tr key={area}>
                            <td className="py-3 font-medium text-slate-900">{areaName}</td>
                            {["view", "create", "edit", "delete"].map(action => (
                              <td key={action} className="py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-slate-300 text-brass-500 focus:ring-brass-500"
                                  checked={newRolePerms[area]?.[action] || false}
                                  onChange={() => togglePerm(area, action)}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setIsCreatingRole(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Role"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
