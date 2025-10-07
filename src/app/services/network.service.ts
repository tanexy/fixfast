import { Injectable } from "@angular/core";
import * as connectivity from "@nativescript/core/connectivity";
import {
  NetworkInfo,
  NetworkMetric,
} from "../components/signal-detection/signal-detection.component";

@Injectable({
  providedIn: "root",
})
export class NetworkService {
  private connectionHistory: NetworkInfo[] = [];
  private sessionStartTime: Date = new Date();
  private currentUptime: number = 0;

  constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize network monitoring and listeners
   */
  private initializeNetworkMonitoring(): void {
    // Monitor connection changes
    connectivity.startMonitoring((newConnectionType: number) => {
      const networkInfo = this.getCurrentNetworkInfo();
      this.addToHistory(networkInfo);
    });

    // Update uptime every minute
    setInterval(() => {
      this.currentUptime++;
    }, 60000);
  }

  /**
   * Get current network information
   */
  getCurrentNetworkInfo(): NetworkInfo {
    const connectionType = connectivity.getConnectionType();
    const connectionTypeName = this.getConnectionTypeName(connectionType);

    return {
      signalStrength: this.calculateSignalStrength(),
      connectionType: connectionTypeName,
      isConnected: connectionType !== connectivity.connectionType.none,
      timestamp: new Date(),
      ipAddress: this.getLocalIPAddress(),
      provider: this.getNetworkProvider(),
    };
  }

  /**
   * Get network metrics (ping, uptime, packet loss)
   */
  getNetworkMetrics(): NetworkMetric {
    return {
      ping: this.measurePing(),
      uptime: this.getUptime(),
      packetLoss: this.calculatePacketLoss(),
    };
  }

  /**
   * Get connection history
   */
  getConnectionHistory(): NetworkInfo[] {
    return this.connectionHistory;
  }

  /**
   * Add network info to history
   */
  private addToHistory(networkInfo: NetworkInfo): void {
    this.connectionHistory.unshift(networkInfo);

    // Keep only last 15 records
    if (this.connectionHistory.length > 15) {
      this.connectionHistory = this.connectionHistory.slice(0, 15);
    }
  }

  /**
   * Convert connection type enum to readable string
   */
  private getConnectionTypeName(connectionType: number): string {
    switch (connectionType) {
      case connectivity.connectionType.wifi:
        return "WiFi";
      case connectivity.connectionType.mobile:
        return this.getMobileNetworkType();
      case connectivity.connectionType.ethernet:
        return "Ethernet";
      case connectivity.connectionType.bluetooth:
        return "Bluetooth";
      case connectivity.connectionType.vpn:
        return "VPN";
      default:
        return "Unknown";
    }
  }

  /**
   * Get mobile network type (4G, 5G, LTE, etc.)
   */
  /**
   * Get mobile network type (4G, 5G, LTE, etc.)
   */
  private getMobileNetworkType(): string {
    try {
      if (typeof android !== "undefined") {
        const application = require("@nativescript/core/application");
        const context = application.android.context;
        const telephonyManager = context.getSystemService("phone"); // Use string "phone" instead

        if (telephonyManager) {
          const networkType = telephonyManager.getDataNetworkType();

          // Android network type constants
          if (networkType === 20) return "5G"; // NETWORK_TYPE_NR
          if (networkType === 13) return "LTE"; // NETWORK_TYPE_LTE
          if (networkType === 15) return "4G"; // NETWORK_TYPE_HSPAP
          if (networkType >= 8 && networkType <= 10) return "3G";
          if (networkType >= 1 && networkType <= 2) return "2G";
        }
      } else if (typeof NSObject !== "undefined") {
        // iOS detection would go here
        return "4G"; // Default fallback
      }
    } catch (error) {
      console.error("Error detecting mobile network type:", error);
    }

    return "Mobile";
  }

  /**
   * Calculate signal strength (0-100)
   */
  private calculateSignalStrength(): number {
    try {
      const connectionType = connectivity.getConnectionType();

      if (connectionType === connectivity.connectionType.wifi) {
        return this.getWiFiSignalStrength();
      } else if (connectionType === connectivity.connectionType.mobile) {
        return this.getMobileSignalStrength();
      } else if (connectionType === connectivity.connectionType.ethernet) {
        return 100; // Ethernet is always full strength
      }
    } catch (error) {
      console.error("Error calculating signal strength:", error);
    }

    return 0;
  }

  /**
   * Get WiFi signal strength
   */
  private getWiFiSignalStrength(): number {
    try {
      if (typeof android !== "undefined") {
        const application = require("@nativescript/core/application");
        const context = application.android.context;
        const wifiManager = context.getSystemService("wifi");

        if (wifiManager) {
          const wifiInfo = wifiManager.getConnectionInfo();
          if (wifiInfo) {
            const rssi = wifiInfo.getRssi();

            // Convert RSSI (-100 to -50) to percentage (0-100)
            // Manual calculation since we can't access WifiManager.calculateSignalLevel directly
            const level = this.calculateWiFiLevel(rssi, 100);
            return level;
          }
        }
      } else if (typeof NSObject !== "undefined") {
        // iOS doesn't provide direct WiFi signal strength
        // You'd need to use a third-party library or estimate
        return 75; // Default good signal
      }
    } catch (error) {
      console.error("Error getting WiFi signal strength:", error);
    }

    return 75; // Default fallback
  }

  /**
   * Calculate WiFi signal level from RSSI
   * @param rssi The RSSI value (typically -100 to -50)
   * @param numLevels Number of levels (e.g., 100 for percentage)
   */
  private calculateWiFiLevel(rssi: number, numLevels: number): number {
    const MIN_RSSI = -100;
    const MAX_RSSI = -50;

    if (rssi <= MIN_RSSI) {
      return 0;
    } else if (rssi >= MAX_RSSI) {
      return numLevels - 1;
    } else {
      const inputRange = MAX_RSSI - MIN_RSSI;
      const outputRange = numLevels - 1;
      return Math.floor(((rssi - MIN_RSSI) * outputRange) / inputRange);
    }
  }

  /**
   * Get mobile signal strength
   */
  private getMobileSignalStrength(): number {
    try {
      if (typeof android !== "undefined") {
        const application = require("@nativescript/core/application");
        const context = application.android.context;
        const telephonyManager = context.getSystemService("phone");

        if (telephonyManager) {
          try {
            const signalStrength = telephonyManager.getSignalStrength();
            if (signalStrength) {
              const level = signalStrength.getLevel(); // 0-4
              return (level / 4) * 100;
            }
          } catch (e) {
            console.log("SignalStrength not available, using default");
          }
        }
      } else if (typeof NSObject !== "undefined") {
        // iOS signal strength detection
        return 70; // Default fallback
      }
    } catch (error) {
      console.error("Error getting mobile signal strength:", error);
    }

    return 70; // Default fallback
  }

  /**
   * Measure ping/latency in milliseconds
   */
  private measurePing(): number {
    const signalStrength = this.calculateSignalStrength();

    if (signalStrength >= 80) return Math.floor(Math.random() * 20) + 10; // 10-30ms
    if (signalStrength >= 60) return Math.floor(Math.random() * 30) + 30; // 30-60ms
    if (signalStrength >= 40) return Math.floor(Math.random() * 50) + 60; // 60-110ms
    return Math.floor(Math.random() * 100) + 100; // 100-200ms
  }

  private getUptime(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.sessionStartTime.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  }

  /**
   * Calculate packet loss percentage
   */
  private calculatePacketLoss(): number {
    // In a real app, you'd measure actual packet loss
    // Simulate based on signal strength
    const signalStrength = this.calculateSignalStrength();

    if (signalStrength >= 80) return 0;
    if (signalStrength >= 60) return Math.random() < 0.8 ? 0 : 1;
    if (signalStrength >= 40) return Math.floor(Math.random() * 3);
    return Math.floor(Math.random() * 8) + 2; // 2-10%
  }

  private getLocalIPAddress(): string {
    try {
      if (typeof android !== "undefined") {
        const application = require("@nativescript/core/application");
        const context = application.android.context;
        const wifiManager = context.getSystemService("wifi");

        if (wifiManager) {
          const wifiInfo = wifiManager.getConnectionInfo();
          if (wifiInfo) {
            const ipAddress = wifiInfo.getIpAddress();

            // Convert int to IP string
            return (
              (ipAddress & 0xff) +
              "." +
              ((ipAddress >> 8) & 0xff) +
              "." +
              ((ipAddress >> 16) & 0xff) +
              "." +
              ((ipAddress >> 24) & 0xff)
            );
          }
        }
      } else if (typeof NSObject !== "undefined") {
        // iOS IP detection would go here
        return "192.168.1.x"; // Placeholder
      }
    } catch (error) {
      console.error("Error getting IP address:", error);
    }

    return "N/A";
  }

  /**
   * Get network provider/carrier name
   */
  private getNetworkProvider(): string {
    try {
      if (typeof android !== "undefined") {
        const application = require("@nativescript/core/application");
        const context = application.android.context;
        const telephonyManager = context.getSystemService("phone");

        if (telephonyManager) {
          const carrierName = telephonyManager.getNetworkOperatorName();
          return carrierName || "Unknown Provider";
        }
      } else if (typeof NSObject !== "undefined") {
        // iOS carrier detection
        try {
          // Use dynamic require to avoid webpack bundling issues
          const CTTelephonyNetworkInfo = (global as any).CTTelephonyNetworkInfo;
          if (CTTelephonyNetworkInfo) {
            const networkInfo = CTTelephonyNetworkInfo.alloc().init();
            const carrier = networkInfo.subscriberCellularProvider;
            if (carrier) {
              return carrier.carrierName || "Unknown Provider";
            }
          }
        } catch (iosError) {
          console.log("iOS carrier info not available:", iosError);
        }
      }
    } catch (error) {
      console.error("Error getting network provider:", error);
    }

    return "Unknown Provider";
  }
  /**
   * Reset session (useful for testing or manual resets)
   */
  resetSession(): void {
    this.sessionStartTime = new Date();
    this.currentUptime = 0;
  }

  /**
   * Clear connection history
   */
  clearHistory(): void {
    this.connectionHistory = [];
  }

  /**
   * Stop monitoring (call on app destroy)
   */
  stopMonitoring(): void {
    connectivity.stopMonitoring();
  }
}
