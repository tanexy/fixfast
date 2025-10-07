import { Injectable } from "@angular/core";
import { LocalNotifications } from "@nativescript/local-notifications";

@Injectable({
  providedIn: "root",
})
export class NotificationsService {
  constructor() {}

  initialize(): void {
    // Request notification permissions
    LocalNotifications.requestPermission().then((granted) => {
      if (granted) {
        console.log("Notification permission granted");
      } else {
        console.log("Notification permission denied");
      }
    });
  }

  showSuccess(message: string): void {
    this.showLocalNotification("Success", message, "success");
  }

  showError(message: string): void {
    this.showLocalNotification("Error", message, "error");
  }

  showWarning(message: string): void {
    this.showLocalNotification("Warning", message, "warning");
  }

  showFaultAlert(title: string, description: string, severity: string): void {
    const id = Date.now();

    LocalNotifications.schedule([
      {
        id: id,
        title: `🚨 ${title}`,
        body: description,
        badge: 1,
        sound: severity === "critical" ? "alarm.mp3" : "notification.mp3",
        at: new Date(Date.now() + 1000), // 1 second delay
      },
    ]);
  }

  showTicketUpdate(ticketTitle: string, newStatus: string): void {
    const id = Date.now();

    LocalNotifications.schedule([
      {
        id: id,
        title: "Ticket Updated",
        body: `${ticketTitle} is now ${newStatus}`,
        badge: 1,
        at: new Date(Date.now() + 1000),
      },
    ]);
  }

  clearAllNotifications(): void {
    LocalNotifications.cancel(0);
  }

  private showLocalNotification(
    title: string,
    message: string,
    type: string
  ): void {
    const id = Date.now();

    let emoji = "💬";
    switch (type) {
      case "success":
        emoji = "✅";
        break;
      case "error":
        emoji = "❌";
        break;
      case "warning":
        emoji = "⚠️";
        break;
    }

    LocalNotifications.schedule([
      {
        id: id,
        title: `${emoji} ${title}`,
        body: message,
        badge: 1,
        at: new Date(Date.now() + 500), // Small delay
      },
    ]);
  }
}
