import { Component, OnInit } from "@angular/core";
import { TicketService } from "../../services/ticket.service";
import { Router } from "@angular/router";
import { AuthService } from "~/app/services/auth.service";

export interface UserProfile {
  ID: string;
  Username: string;
  Email: string;
  Role?: string;
}

export interface UserStats {
  ticketsThisMonth: number;
  averageResolutionTime: number;
  mostCommonIssueType: string;
  lastActivity: Date;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
  color: string;
}

@Component({
  selector: "ns-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile;

  stats: UserStats = {
    ticketsThisMonth: 0,
    averageResolutionTime: 0,
    mostCommonIssueType: "HVAC Issues",
    lastActivity: new Date(),
  };

  quickActions: QuickAction[] = [
    
  ];

  menuItems = [
    { icon: "⚙️", label: "Settings", action: "settings" },
    { icon: "🔔", label: "Notifications", action: "notifications" },
    { icon: "❓", label: "Help & Support", action: "help" },
  ];

  isLoggedIn: boolean = true;
  recentTickets: any[] = [];
  isAdmin: boolean = false;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
    this.loadRecentTickets();
  }

  loadUserProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profile = user;
      this.isAdmin = user.Role === "admin";
      this.loadQuickActions();
    } else {
      this.isAdmin= false;
      this.loadQuickActions();
    }
  }

  loadUserStats(): void {
    this.stats = {
      ticketsThisMonth: 5,
      averageResolutionTime: 2.3,
      mostCommonIssueType: "HVAC Issues",
      lastActivity: new Date(),
    };

    //this.profile.totalTicketsReported = 23;
    //this.profile.totalTicketsResolved = 18;
  }

  loadRecentTickets(): void {
    this.ticketService
      .getTicketsByUser(this.profile.ID)
      .subscribe((tickets) => {
        this.recentTickets = tickets.slice(0, 3);
      });
  }
  loadQuickActions(): void {
    if (this.isAdmin) {
      this.quickActions=  [
    {
      id: "tickets",
      icon: "🎫",
      label: "My Tickets",
      route: "/tickets",
      color: "#3b82f6",
    },
    {
      id: "inventory",
      icon: "📦",
      label: "Inventory",
      route: "/inventory",
      color: "#8b5cf6",
    },
    {
      id: "reports",
      icon: "📊",
      label: "Reports",
      route: "/report-form",
      color: "#10b981",
    },
    {
      id: "users",
      icon: "👥",
      label: "Users",
      route: "/users",
      color: "#f59e0b",
    },
  ];
  }
  else{
    this.quickActions = [
    {
      id: "tickets",
      icon: "🎫",
      label: "My Tickets",
      route: "/tickets",
      color: "#3b82f6",
    },
    {
      id: "reports",
      icon: "📊",
      label: "Reports",
      route: "/report-form",
      color: "#10b981",
    },
  
  ];
  }
}

  getTicketStatusColor(status: string): string {
    switch (status) {
      case "open":
        return "#ef4444";
      case "in-progress":
        return "#f59e0b";
      case "resolved":
        return "#22c55e";
      case "closed":
        return "#94a3b8";
      default:
        return "#3b82f6";
    }
  }

  getInitials(): string {
    return this.profile.Username.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onQuickAction(action: QuickAction): void {
    this.router.navigate([action.route]);
  }

  onMenuItem(action: string): void {
    console.log("Menu item clicked:", action);
    switch (action) {
      case "settings":
        // Navigate to settings
        break;
      case "notifications":
        // Navigate to notifications
        break;
      case "help":
        // Navigate to help
        break;
      case "privacy":
        // Navigate to privacy policy
        break;
      case "about":
        // Show about dialog
        break;
    }
  }

  editProfile(): void {
    console.log("Edit profile");
    // TODO: Navigate to profile edit screen
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(["/login"]);
   
  }
}