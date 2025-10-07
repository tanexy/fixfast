import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TicketService } from "~/app/services/ticket.service";

export interface User {
  ID: number;
  Username: string;
  Email: string;
  Role: "admin" | "technician" | "operator" | "viewer";
  Avatar?: string;
  Status: "active" | "inactive" | "suspended";
  TasksCompleted: number;
  FaultsResolved: number;
  LastActive: Date;
  JoinedDate: Date;
  Department: string;
}

@Component({
  selector: "ns-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.css"],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = "";
  selectedFilter: string = "all";

  stats = {
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    technicians: 0,
  };

  constructor(private router: Router, private userService: TicketService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.calculateStats();
  }

  async loadUsers(): Promise<void> {
    try {
      this.users = await this.userService.getUsers();
      this.filteredUsers = [...this.users];
      console.log("Loaded users:", this.users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  calculateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(
      (u) => u.Status === "active"
    ).length;
    this.stats.admins = this.users.filter((u) => u.Role === "admin").length;
    this.stats.technicians = this.users.filter(
      (u) => u.Role === "technician"
    ).length;
  }

  filterUsers(filter: string): void {
    this.selectedFilter = filter;

    if (filter === "all") {
      this.filteredUsers = [...this.users];
    } else if (filter === "active") {
      this.filteredUsers = this.users.filter((u) => u.Status === "active");
    } else if (filter === "inactive") {
      this.filteredUsers = this.users.filter((u) => u.Status === "inactive");
    } else {
      this.filteredUsers = this.users.filter((u) => u.Role === filter);
    }
  }

  searchUsers(query: string): void {
    this.searchQuery = query.toLowerCase();

    if (!query) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(
      (user) =>
        user.Username.toLowerCase().includes(this.searchQuery) ||
        user.Email.toLowerCase().includes(this.searchQuery) ||
        user.Department.toLowerCase().includes(this.searchQuery)
    );
  }

  deleteUser(userId: number): void {
    if (confirm("Are you sure you want to delete this user?")) {
      this.users = this.users.filter((u) => u.ID !== userId);
      this.filteredUsers = this.filteredUsers.filter((u) => u.ID !== userId);
      this.calculateStats();
      this.userService.deleteUser(userId);
      
    }
  }

  toggleAdminRights(user: User): void {
    if (user.Role === "admin") {
      user.Role = "technician";
      this.userService.revokeAdminRights(user.ID);
    } else {
      user.Role = "admin";
      this.userService.changeRole(user.ID);
    }
    this.calculateStats();
  }
 

  viewUserDetails(userId: string): void {
    // Navigate to user details page
    this.router.navigate(["/usertasks"]);
  }

  toggleUserStatus(user: User): void {
    user.Status = user.Status === "active" ? "inactive" : "active";
    this.calculateStats();
  }

  addNewUser(): void {
    // Navigate to add user page or open modal
    console.log("Add new user");
  }

  getRoleColor(role: string): string {
    switch (role) {
      case "admin":
        return "#8b5cf6";
      case "technician":
        return "#3b82f6";
      case "operator":
        return "#10b981";
      case "viewer":
        return "#6b7280";
      default:
        return "#9ca3af";
    }
  }

  getRoleBadgeText(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "active":
        return "#10b981";
      case "inactive":
        return "#ef4444";
      case "suspended":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  }

  getAvatarInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  getTimeAgo(date: Date): string {
    if (!date) return "Unknown";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return "Just now";
    }
  }
}
