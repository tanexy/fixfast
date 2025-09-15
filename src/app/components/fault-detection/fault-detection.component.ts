import { Component, OnInit, OnDestroy } from "@angular/core";
import { FaultDetectionService } from "../../services/fault-detection.service";
import { NotificationsService } from "../../services/notifications.service";

export interface FaultDetection {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  timestamp: Date;
  status: "detected" | "investigating" | "resolved";
}

@Component({
  selector: "ns-fault-detection",
  templateUrl: "./fault-detection.component.html",
  styleUrls: ["./fault-detection.component.css"],
})
export class FaultDetectionComponent implements OnInit, OnDestroy {
  faults: FaultDetection[] = [];
  criticalFaults: FaultDetection[] = [];
  isMonitoring: boolean = false;
  fuelLevel: number = 0;
  fuelLevelNormal: boolean = true;
  temperature: number = 0;
  signalStrength: number = 0;
  isSignalOk: boolean = false;
  batteryLevel: number = 0;
  temperatureNormal: boolean = true;
  lastScanTime: Date | null = null;

  constructor(
    private faultDetectionService: FaultDetectionService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.loadFaults();
    this.subscribeFaultUpdates();
    this.getTemperatureStatus();
    this.getFuelLevelStatus();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
  }

  loadFaults(): void {
    this.faults = this.faultDetectionService.getDetectedFaults();
    this.criticalFaults = this.faultDetectionService.getCriticalFaults();
    this.isMonitoring = this.faultDetectionService.isMonitoringActive();
    this.batteryLevel = this.faultDetectionService.getBatteryLevel();
    this.lastScanTime = this.faultDetectionService.getLastScanTime();
    this.fuelLevel = this.faultDetectionService.getFuelLevel();
    this.temperature = this.faultDetectionService.getTemperature();
    this.signalStrength = this.faultDetectionService.getSignalStrength();
  }
  getTemperatureStatus() {
    if (this.temperature < 50) {
      this.temperatureNormal;
    } else {
      this.temperatureNormal = false;
    }
  }
  getFuelLevelStatus() {
    if (this.fuelLevel > 50) {
      this.fuelLevelNormal = true;
    } else {
      this.fuelLevelNormal = false;
    }
  }
  getSignalStatus() {
    if (this.signalStrength < 50 || this.signalStrength < 0) {
      this.isSignalOk = true;
    } else {
      this.isSignalOk = false;
    }
  }
  runManualScan(): void {
    this.faultDetectionService.runManualScan();
  }

  toggleMonitoring(): void {
    if (this.isMonitoring) {
      this.faultDetectionService.stopBackgroundMonitoring();
    } else {
      this.faultDetectionService.startBackgroundMonitoring();
    }
    this.isMonitoring = !this.isMonitoring;
  }

  private subscribeFaultUpdates(): void {}

  getSeverityColor(severity: string): string {
    switch (severity) {
      case "critical":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#FFC107";
      case "low":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  }

  getHighPriorityCount(): number {
    return this.faults.filter(
      (fault) => fault.severity === "critical" || fault.severity === "high"
    ).length;
  }

  getFaultIcon(type: string): string {
    const icons = {
      temperature: "🌡️",
      network: "🌐",
      power: "⚡",
      storage: "💾",
      cpu: "🖥️",
      memory: "🧠",
      security: "🔒",
      database: "🗄️",
      hardware: "🔧",
      software: "💻",
      default: "⚙️",
    };
    return icons[type] || icons["default"];
  }

  getPriorityEmoji(severity: string): string {
    const emojis = {
      critical: "💥",
      high: "🔥",
      medium: "⚠️",
      low: "ℹ️",
    };
    return emojis[severity] || emojis["low"];
  }

  getTimeAgo(timestamp: Date): string {
    if (!timestamp) return "Unknown";

    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
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
