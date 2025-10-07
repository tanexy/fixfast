import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "completed" | "on-hold";
  progress: number; // 0-100
  assignedDate: Date;
  dueDate: Date;
  completedDate?: Date;
  category: string;
  location: string;
  estimatedHours: number;
  actualHours?: number;
}

export interface UserTaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  averageCompletionTime: number; // in hours
  completionRate: number; // percentage
  onTimeRate: number; // percentage
  totalHoursWorked: number;
}

@Component({
  selector: "ns-user-tasks",
  templateUrl: "./user-tasks.component.html",
  styleUrls: ["./user-tasks.component.css"],
})
export class UserTasksComponent implements OnInit {
  userId: string = "";
  userName: string = "John Doe";
  userRole: string = "Technician";

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter: string = "all";

  get userInitials(): string {
    return this.userName
      ? this.userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";
  }

  stats: UserTaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    onTimeRate: 0,
    totalHoursWorked: 0,
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["id"] || "1";
    this.loadUserTasks();
    this.calculateStats();
  }

  loadUserTasks(): void {
    // Mock data - replace with actual service call
    this.tasks = [
      {
        id: "T001",
        title: "Replace Server Cooling Fan",
        description:
          "Server rack 3B cooling fan is making unusual noise and needs replacement",
        priority: "high",
        status: "in-progress",
        progress: 65,
        assignedDate: new Date("2024-09-28"),
        dueDate: new Date("2024-10-03"),
        category: "Hardware",
        location: "Data Center - Floor 2",
        estimatedHours: 4,
        actualHours: 2.5,
      },
      {
        id: "T002",
        title: "Network Cable Routing",
        description:
          "Install and route network cables for new workstations in Office Block C",
        priority: "medium",
        status: "completed",
        progress: 100,
        assignedDate: new Date("2024-09-25"),
        dueDate: new Date("2024-09-30"),
        completedDate: new Date("2024-09-29"),
        category: "Network",
        location: "Office Block C",
        estimatedHours: 6,
        actualHours: 5.5,
      },
      {
        id: "T003",
        title: "UPS Battery Replacement",
        description: "Replace aging UPS batteries in main server room",
        priority: "critical",
        status: "pending",
        progress: 0,
        assignedDate: new Date("2024-10-01"),
        dueDate: new Date("2024-10-05"),
        category: "Power",
        location: "Main Server Room",
        estimatedHours: 8,
      },
      {
        id: "T004",
        title: "Security Camera Installation",
        description: "Install 5 new security cameras in parking area",
        priority: "medium",
        status: "in-progress",
        progress: 40,
        assignedDate: new Date("2024-09-26"),
        dueDate: new Date("2024-10-04"),
        category: "Security",
        location: "Parking Area B",
        estimatedHours: 10,
        actualHours: 4,
      },
      {
        id: "T005",
        title: "Firewall Configuration Update",
        description: "Update firewall rules and security policies",
        priority: "high",
        status: "completed",
        progress: 100,
        assignedDate: new Date("2024-09-20"),
        dueDate: new Date("2024-09-27"),
        completedDate: new Date("2024-09-26"),
        category: "Security",
        location: "Network Operations Center",
        estimatedHours: 5,
        actualHours: 4.5,
      },
      {
        id: "T006",
        title: "Backup System Verification",
        description: "Test and verify backup systems are functioning correctly",
        priority: "medium",
        status: "completed",
        progress: 100,
        assignedDate: new Date("2024-09-18"),
        dueDate: new Date("2024-09-25"),
        completedDate: new Date("2024-09-24"),
        category: "Storage",
        location: "Data Center - Floor 1",
        estimatedHours: 3,
        actualHours: 3,
      },
      {
        id: "T007",
        title: "Patch Panel Organization",
        description: "Reorganize and label all patch panel connections",
        priority: "low",
        status: "on-hold",
        progress: 20,
        assignedDate: new Date("2024-09-22"),
        dueDate: new Date("2024-10-10"),
        category: "Network",
        location: "Network Closet",
        estimatedHours: 12,
        actualHours: 2,
      },
      {
        id: "T008",
        title: "Temperature Sensor Calibration",
        description: "Calibrate all temperature sensors in server rooms",
        priority: "medium",
        status: "pending",
        progress: 0,
        assignedDate: new Date("2024-10-02"),
        dueDate: new Date("2024-10-06"),
        category: "Monitoring",
        location: "All Server Rooms",
        estimatedHours: 4,
      },
    ];

    this.filteredTasks = [...this.tasks];
  }

  calculateStats(): void {
    this.stats.totalTasks = this.tasks.length;
    this.stats.completedTasks = this.tasks.filter(
      (t) => t.status === "completed"
    ).length;
    this.stats.inProgressTasks = this.tasks.filter(
      (t) => t.status === "in-progress"
    ).length;
    this.stats.pendingTasks = this.tasks.filter(
      (t) => t.status === "pending"
    ).length;

    // Calculate completion rate
    this.stats.completionRate =
      this.stats.totalTasks > 0
        ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100)
        : 0;

    // Calculate average completion time
    const completedTasks = this.tasks.filter(
      (t) => t.status === "completed" && t.completedDate
    );
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const diffMs =
          task.completedDate!.getTime() - task.assignedDate.getTime();
        return sum + diffMs / (1000 * 60 * 60); // Convert to hours
      }, 0);
      this.stats.averageCompletionTime = Math.round(
        totalTime / completedTasks.length
      );
    }

    // Calculate on-time completion rate
    const onTimeTasks = completedTasks.filter(
      (t) => t.completedDate && t.completedDate <= t.dueDate
    );
    this.stats.onTimeRate =
      completedTasks.length > 0
        ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
        : 0;

    // Calculate total hours worked
    this.stats.totalHoursWorked = this.tasks
      .filter((t) => t.actualHours)
      .reduce((sum, task) => sum + (task.actualHours || 0), 0);
  }

  filterTasks(filter: string): void {
    this.selectedFilter = filter;

    if (filter === "all") {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter((t) => t.status === filter);
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case "critical":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "medium":
        return "#eab308";
      case "low":
        return "#22c55e";
      default:
        return "#9ca3af";
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "completed":
        return "#10b981";
      case "in-progress":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      case "on-hold":
        return "#6b7280";
      default:
        return "#9ca3af";
    }
  }

  getStatusIcon(
    status: "completed" | "in-progress" | "pending" | "on-hold"
  ): string {
    const icons: Record<
      "completed" | "in-progress" | "pending" | "on-hold",
      string
    > = {
      completed: "✓",
      "in-progress": "⚡",
      pending: "⏳",
      "on-hold": "⏸",
    };
    return icons[status] || "•";
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Hardware: "🔧",
      Network: "🌐",
      Power: "⚡",
      Security: "🔒",
      Storage: "💾",
      Monitoring: "📊",
      Software: "💻",
    };
    return icons[category] ?? "📋";
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return "#10b981";
    if (progress >= 50) return "#3b82f6";
    if (progress >= 25) return "#f59e0b";
    return "#ef4444";
  }

  getDaysRemaining(dueDate: Date): number {
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  getDueDateText(dueDate: Date): string {
    const days = this.getDaysRemaining(dueDate);

    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days}d remaining`;
  }

  getDueDateColor(dueDate: Date, status: string): string {
    if (status === "completed") return "#10b981";

    const days = this.getDaysRemaining(dueDate);
    if (days < 0) return "#ef4444";
    if (days <= 1) return "#f97316";
    if (days <= 3) return "#f59e0b";
    return "#6b7280";
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  viewTaskDetails(taskId: string): void {
    console.log("View task details:", taskId);
    // Navigate to task details page
  }

  updateTaskProgress(task: Task): void {
    console.log("Update progress for task:", task.id);
    // Open progress update modal
  }
}
