import { Component, OnInit, OnDestroy } from "@angular/core";
import { NetworkService } from "../../services/network.service";

export interface NetworkInfo {
  signalStrength: number;
  connectionType: string;
  isConnected: boolean;
  timestamp: Date;
  ipAddress?: string;
  provider?: string;
}

export interface NetworkMetric {
  ping: number; // ms
  uptime: number; // minutes
  packetLoss: number; // percentage
}

@Component({
  selector: "ns-signal-detection",
  templateUrl: "./signal-detection.component.html",
  styleUrls: ["./signal-detection.component.css"],
})
export class SignalDetectionComponent implements OnInit, OnDestroy {
  networkInfo: NetworkInfo | null = null;
  networkMetrics: NetworkMetric = {
    ping: 0,
    uptime: 0,
    packetLoss: 0,
  };

  connectionHistory: NetworkInfo[] = [];
  isRefreshing: boolean = false;

  private statusCheckInterval: any;
  private metricsInterval: any;

  constructor(private networkService: NetworkService) {}

  ngOnInit(): void {
    this.loadNetworkInfo();
    this.loadConnectionHistory();
    this.startStatusMonitoring();
    this.startMetricsMonitoring();
  }

  ngOnDestroy(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  async loadNetworkInfo(): Promise<void> {
    this.isRefreshing = true;
    try {
      this.networkInfo = this.networkService.getCurrentNetworkInfo();
      this.networkMetrics = this.networkService.getNetworkMetrics();
    } catch (error) {
      console.error("Failed to load network info:", error);
    } finally {
      setTimeout(() => {
        this.isRefreshing = false;
      }, 500);
    }
  }

  loadConnectionHistory(): void {
    this.connectionHistory = this.networkService.getConnectionHistory();
  }

  private startStatusMonitoring(): void {
    // Check network status every 10 seconds
    this.statusCheckInterval = setInterval(() => {
      this.updateNetworkStatus();
    }, 10000);
  }

  private startMetricsMonitoring(): void {
    // Update metrics every 5 seconds
    this.metricsInterval = setInterval(() => {
      this.updateNetworkMetrics();
    }, 5000);
  }

  private updateNetworkStatus(): void {
    const newInfo = this.networkService.getCurrentNetworkInfo();

    // Check if connection status changed
    if (
      this.networkInfo &&
      newInfo.isConnected !== this.networkInfo.isConnected
    ) {
      this.connectionHistory.unshift(newInfo);
      if (this.connectionHistory.length > 15) {
        this.connectionHistory = this.connectionHistory.slice(0, 15);
      }
    }

    this.networkInfo = newInfo;
  }

  private updateNetworkMetrics(): void {
    this.networkMetrics = this.networkService.getNetworkMetrics();
  }

  getSignalStrengthColor(strength: number): string {
    if (strength >= 80) return "#4CAF50";
    if (strength >= 60) return "#8BC34A";
    if (strength >= 40) return "#FFC107";
    if (strength >= 20) return "#FF9800";
    return "#F44336";
  }

  getSignalStrengthText(strength: number): string {
    if (strength >= 80) return "Excellent";
    if (strength >= 60) return "Good";
    if (strength >= 40) return "Fair";
    if (strength >= 20) return "Poor";
    return "Very Poor";
  }

  getConnectionTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case "wifi":
        return "📶";
      case "4g":
      case "lte":
        return "📱";
      case "5g":
        return "🚀";
      case "ethernet":
        return "🔌";
      default:
        return "🌐";
    }
  }

  getConnectionStatusIcon(isConnected: boolean): string {
    return isConnected ? "✅" : "❌";
  }

  getPingQuality(ping: number): string {
    if (ping < 20) return "Excellent";
    if (ping < 50) return "Good";
    if (ping < 100) return "Fair";
    return "Poor";
  }

  getPingColor(ping: number): string {
    if (ping < 20) return "#4CAF50";
    if (ping < 50) return "#8BC34A";
    if (ping < 100) return "#FFC107";
    return "#F44336";
  }

  formatUptime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getPacketLossStatus(loss: number): string {
    if (loss === 0) return "Stable";
    if (loss < 2) return "Minor Loss";
    if (loss < 5) return "Moderate Loss";
    return "Critical";
  }

  getPacketLossColor(loss: number): string {
    if (loss === 0) return "#4CAF50";
    if (loss < 2) return "#8BC34A";
    if (loss < 5) return "#FFC107";
    return "#F44336";
  }
}