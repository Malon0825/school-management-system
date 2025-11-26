"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  KeyRound,
  Shield,
  UserX,
  UserCheck,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserRole } from "@/core/auth/types";

// ============================================================================
// Types
// ============================================================================

interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  primaryRole: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full system access" },
  { value: "ADMIN", label: "Admin", description: "Administrative access" },
  { value: "TEACHER", label: "Teacher", description: "Teaching staff access" },
  { value: "SCANNER", label: "Scanner", description: "Event scanning access" },
  { value: "STAFF", label: "Staff", description: "General staff access" },
  { value: "PARENT", label: "Parent", description: "Parent portal access" },
];

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-[#1B4D3E] text-white border-[#1B4D3E]",
  ADMIN: "bg-[#1B4D3E]/80 text-white border-[#1B4D3E]/80",
  TEACHER: "bg-blue-100 text-blue-700 border-blue-200",
  SCANNER: "bg-purple-100 text-purple-700 border-purple-200",
  STAFF: "bg-gray-100 text-gray-700 border-gray-200",
  PARENT: "bg-amber-100 text-amber-700 border-amber-200",
};

// ============================================================================
// Mock Data (Replace with API calls)
// ============================================================================

const MOCK_USERS: UserListItem[] = [
  {
    id: "1",
    email: "superadmin@gvcfis.edu.ph",
    fullName: "Super Admin",
    roles: ["SUPER_ADMIN"],
    primaryRole: "SUPER_ADMIN",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-11-26T10:30:00Z",
  },
  {
    id: "2",
    email: "admin@gvcfis.edu.ph",
    fullName: "John Administrator",
    roles: ["ADMIN"],
    primaryRole: "ADMIN",
    isActive: true,
    createdAt: "2024-02-15T00:00:00Z",
    lastLoginAt: "2024-11-25T14:20:00Z",
  },
  {
    id: "3",
    email: "teacher1@gvcfis.edu.ph",
    fullName: "Maria Santos",
    roles: ["TEACHER"],
    primaryRole: "TEACHER",
    isActive: true,
    createdAt: "2024-03-10T00:00:00Z",
    lastLoginAt: "2024-11-26T08:15:00Z",
  },
  {
    id: "4",
    email: "scanner1@gvcfis.edu.ph",
    fullName: "Pedro Cruz",
    roles: ["SCANNER"],
    primaryRole: "SCANNER",
    isActive: true,
    createdAt: "2024-04-20T00:00:00Z",
    lastLoginAt: "2024-11-26T07:00:00Z",
  },
  {
    id: "5",
    email: "staff1@gvcfis.edu.ph",
    fullName: "Ana Reyes",
    roles: ["STAFF"],
    primaryRole: "STAFF",
    isActive: false,
    createdAt: "2024-05-05T00:00:00Z",
    lastLoginAt: "2024-10-15T09:30:00Z",
  },
];

// ============================================================================
// Component
// ============================================================================

export default function ManageUsersPage() {
  const { user: currentUser, isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isUpdateRoleDialogOpen, setIsUpdateRoleDialogOpen] = useState(false);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    role: "STAFF" as UserRole,
    sendInvite: true,
  });
  const [updateRoleForm, setUpdateRoleForm] = useState<UserRole>("STAFF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(MOCK_USERS);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.primaryRole === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleCreateUser = async () => {
    if (!createForm.fullName.trim() || !createForm.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: UserListItem = {
        id: String(Date.now()),
        email: createForm.email,
        fullName: createForm.fullName,
        roles: [createForm.role],
        primaryRole: createForm.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      };

      setUsers((prev) => [...prev, newUser]);
      setIsCreateDialogOpen(false);
      setCreateForm({ fullName: "", email: "", role: "STAFF", sendInvite: true });

      toast.success("User created successfully", {
        description: createForm.sendInvite
          ? `An invitation email has been sent to ${createForm.email}`
          : "User can now sign in with their credentials",
      });
    } catch (error) {
      toast.error("Failed to create user");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsResetPasswordDialogOpen(false);
      toast.success("Password reset email sent", {
        description: `A password reset link has been sent to ${selectedUser.email}`,
      });
    } catch (error) {
      toast.error("Failed to send reset email");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, primaryRole: updateRoleForm, roles: [updateRoleForm] }
            : u
        )
      );

      setIsUpdateRoleDialogOpen(false);
      toast.success("Role updated successfully", {
        description: `${selectedUser.fullName}'s role has been changed to ${updateRoleForm}`,
      });
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newStatus = !selectedUser.isActive;
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, isActive: newStatus } : u))
      );

      setIsToggleStatusDialogOpen(false);
      toast.success(newStatus ? "User enabled" : "User disabled", {
        description: `${selectedUser.fullName} has been ${newStatus ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast.error("Failed to update user status");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  const openResetPasswordDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const openUpdateRoleDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setUpdateRoleForm(user.primaryRole);
    setIsUpdateRoleDialogOpen(true);
  };

  const openToggleStatusDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setIsToggleStatusDialogOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canManageUser = (user: UserListItem) => {
    // Super admins can manage everyone except themselves
    if (isSuperAdmin()) return user.id !== currentUser?.id;
    // Admins can manage non-admin users
    if (isAdmin()) return !["SUPER_ADMIN", "ADMIN"].includes(user.primaryRole);
    return false;
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-[#F9FAFB] via-[#FDFBF7] to-[#F3F4F6]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create, update, and manage user accounts and permissions
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E]/20"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-200">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">User</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden md:table-cell">
                  Last Login
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[60px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-gray-500">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200">
                          <AvatarImage src={undefined} alt={user.fullName} />
                          <AvatarFallback className="bg-[#1B4D3E] text-white text-sm font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${ROLE_BADGE_STYLES[user.primaryRole]} font-medium`}
                      >
                        {user.primaryRole.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {formatDate(user.lastLoginAt)}
                    </TableCell>
                    <TableCell>
                      {canManageUser(user) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-lg border border-gray-200 shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => openResetPasswordDialog(user)}
                              className="gap-2 cursor-pointer text-gray-700 hover:bg-[#1B4D3E]/5 hover:text-[#1B4D3E] focus:bg-[#1B4D3E]/5 focus:text-[#1B4D3E]"
                            >
                              <KeyRound className="w-4 h-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openUpdateRoleDialog(user)}
                              className="gap-2 cursor-pointer text-gray-700 hover:bg-[#1B4D3E]/5 hover:text-[#1B4D3E] focus:bg-[#1B4D3E]/5 focus:text-[#1B4D3E]"
                            >
                              <Shield className="w-4 h-4" />
                              Update Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem
                              onClick={() => openToggleStatusDialog(user)}
                              className={`gap-2 cursor-pointer ${
                                user.isActive
                                  ? "text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                                  : "text-green-600 hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
                              }`}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="w-4 h-4" />
                                  Disable User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4" />
                                  Enable User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create New User
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Add a new user to the system. They will receive an email invitation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@school.edu.ph"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={createForm.role}
                onValueChange={(value: UserRole) =>
                  setCreateForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E]/20">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {ROLE_OPTIONS.find((r) => r.value === createForm.role)?.description}
              </p>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <Label htmlFor="sendInvite" className="text-sm text-gray-700">
                  Send email invitation
                </Label>
              </div>
              <Switch
                id="sendInvite"
                checked={createForm.sendInvite}
                onCheckedChange={(checked) =>
                  setCreateForm((prev) => ({ ...prev, sendInvite: checked }))
                }
                className="data-[state=checked]:bg-[#1B4D3E]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isSubmitting}
              className="bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Send a password reset link to the user&apos;s email address.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarFallback className="bg-[#1B4D3E] text-white font-semibold">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                A password reset email will be sent to{" "}
                <span className="font-medium text-gray-900">{selectedUser.email}</span>.
                The link will expire in 24 hours.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isSubmitting}
              className="bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isUpdateRoleDialogOpen} onOpenChange={setIsUpdateRoleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Update User Role
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Change the role and permissions for this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarFallback className="bg-[#1B4D3E] text-white font-semibold">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Current Role
                </Label>
                <Badge className={`${ROLE_BADGE_STYLES[selectedUser.primaryRole]}`}>
                  {selectedUser.primaryRole.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRole" className="text-sm font-medium text-gray-700">
                  New Role
                </Label>
                <Select value={updateRoleForm} onValueChange={(v: UserRole) => setUpdateRoleForm(v)}>
                  <SelectTrigger className="border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <span className="font-medium">{role.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {ROLE_OPTIONS.find((r) => r.value === updateRoleForm)?.description}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsUpdateRoleDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isSubmitting || updateRoleForm === selectedUser?.primaryRole}
              className="bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog open={isToggleStatusDialogOpen} onOpenChange={setIsToggleStatusDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {selectedUser?.isActive ? "Disable User" : "Enable User"}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {selectedUser?.isActive
                ? "This user will no longer be able to access the system."
                : "This user will regain access to the system."}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarFallback className="bg-[#1B4D3E] text-white font-semibold">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
                <Badge
                  className={`ml-auto ${
                    selectedUser.isActive
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {selectedUser.isActive && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Warning:</strong> Disabling this user will immediately revoke
                    their access. Any active sessions will be terminated.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsToggleStatusDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleUserStatus}
              disabled={isSubmitting}
              className={
                selectedUser?.isActive
                  ? "bg-red-600 hover:bg-red-700 text-white gap-2"
                  : "bg-green-600 hover:bg-green-700 text-white gap-2"
              }
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {selectedUser?.isActive ? "Disable User" : "Enable User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
