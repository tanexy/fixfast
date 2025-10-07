import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { TicketService } from "../../services/ticket.service";
import { NotificationsService } from "../../services/notifications.service";
import { takePicture, requestPermissions } from "@nativescript/camera";
import * as imagepicker from "@nativescript/imagepicker";

export interface ProgressPhoto {
  name: string;
  uri: string;
}

export interface ProgressReport {
  selectedTaskId: number | null;
  status: string;
  progressPercentage: number;
  workCompleted: string;
  challenges: string;
  nextSteps: string;
  hoursSpent: number;
  minutesSpent: number;
  photos: ProgressPhoto[];
  notes: string;
}

export interface Task {
  id: number;
  title: string;
  location: string;
  assignedDate: Date;
  priority?: string;
  dueDate?: Date;
}

@Component({
  selector: "ns-report-form",
  templateUrl: "./report-form.component.html",
  styleUrls: ["./report-form.component.css"],
})
export class ReportFormComponent implements OnInit {
  report: ProgressReport = {
    selectedTaskId: null,
    status: "",
    progressPercentage: 0,
    workCompleted: "",
    challenges: "",
    nextSteps: "",
    hoursSpent: 0,
    minutesSpent: 0,
    photos: [],
    notes: "",
  };

  // Example data for task selection
  assignedTasks: Task[] = [
    {
      id: 1,
      title: "Fix login bug",
      location: "Module A",
      assignedDate: new Date(),
      priority: "High",
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
    {
      id: 2,
      title: "Implement dashboard",
      location: "Module B",
      assignedDate: new Date(),
      priority: "Medium",
      dueDate: new Date(Date.now() + 86400000 * 5),
    },
    {
      id: 3,
      title: "Network diagnostics",
      location: "Server Room",
      assignedDate: new Date(),
      priority: "Low",
      dueDate: new Date(Date.now() + 86400000 * 7),
    },
    {
      id: 4,
      title: "Update documentation",
      location: "Module C",
      assignedDate: new Date(),
      priority: "Medium",
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
  ];

  selectedTask: Task | null = null;
  showReportForm = false;

  progressStatuses = [
    { key: "not_started", display: "Not Started", class: "status-not-started" },
    { key: "in_progress", display: "In Progress", class: "status-in-progress" },
    { key: "done", display: "Done", class: "status-done" },
  ];

  isSubmitting = false;

  constructor(
    private ticketService: TicketService,
    private notificationsService: NotificationsService,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit(): void {
    console.log("ReportForm component initialized");
    console.log("Available tasks:", this.assignedTasks);
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.report.selectedTaskId = task.id;
    this.showReportForm = true;
    console.log("Selected task:", task.title);
  }

  cancelReport(): void {
    this.selectedTask = null;
    this.report.selectedTaskId = null;
    this.showReportForm = false;
    // Reset form fields but keep basic structure
    this.report.status = "";
    this.report.progressPercentage = 0;
    this.report.workCompleted = "";
    this.report.challenges = "";
    this.report.nextSteps = "";
    this.report.hoursSpent = 0;
    this.report.minutesSpent = 0;
    this.report.photos = [];
    this.report.notes = "";
  }

  getPriorityColor(priority?: string): string {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#dc2626";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#64748b";
    }
  }

  async addPhoto() {
    try {
      const choice = await Promise.resolve(
        prompt("Choose: 1 = Camera, 2 = Gallery")
      );

      if (choice === "1") {
        await requestPermissions();

        const photo = await takePicture({
          width: 800,
          height: 800,
          keepAspectRatio: true,
          saveToGallery: true,
        });

        if (photo) {
          this.report.photos.push({
            name: `photo-${Date.now()}.jpg`,
            uri: photo.android || photo.ios,
          });
          this.notificationsService.showSuccess("Photo added");
        }
      } else if (choice === "2") {
        const context = imagepicker.create({ mode: "single" });
        await context.authorize();
        const selection = await context.present();

        if (selection.length > 0) {
          const img = selection[0];
          this.report.photos.push({
            name: `gallery-${Date.now()}.jpg`,
            uri: img.path,
          });
          this.notificationsService.showSuccess("Photo added from gallery");
        }
      }
    } catch (err) {
      console.error("Photo error:", err);
      this.notificationsService.showError("Failed to add photo");
    }
  }

  removePhoto(index: number): void {
    const removed = this.report.photos.splice(index, 1);
    this.notificationsService.showSuccess("Photo removed");
  }

  isFormValid(): boolean {
    return !!(
      this.report.selectedTaskId &&
      this.report.status &&
      this.report.workCompleted.trim()
    );
  }

  onSubmit(): void {
    console.log("📤 Submitting report:", this.report);

    if (!this.isFormValid()) {
      this.notificationsService.showError("Please fill in all required fields");
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      this.notificationsService.showSuccess(
        "Progress report submitted successfully!"
      );
      this.resetForm();
      this.isSubmitting = false;
      // Uncomment to navigate after submission
      // this.routerExtensions.navigate(["/dashboard"]);
    }, 1500);

    /* Real API call - uncomment when ready
    this.ticketService
      .createTicket(this.report)
      .then(() => {
        this.notificationsService.showSuccess("Report submitted successfully!");
        this.resetForm();
        this.routerExtensions.navigate(["/tickets"]);
      })
      .catch((error) => {
        this.notificationsService.showError(
          "Failed to submit report. Please try again."
        );
        console.error("Report submission error:", error);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
    */
  }

  private resetForm(): void {
    this.report = {
      selectedTaskId: null,
      status: "",
      progressPercentage: 0,
      workCompleted: "",
      challenges: "",
      nextSteps: "",
      hoursSpent: 0,
      minutesSpent: 0,
      photos: [],
      notes: "",
    };
    this.selectedTask = null;
    this.showReportForm = false;
  }

  getDaysUntilDue(dueDate?: Date): string {
    if (!dueDate) return "";
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days left`;
  }
}
