import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, timer } from "rxjs";

export interface FaultDetection {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  timestamp: Date;
  status: "detected" | "investigating" | "resolved";
}

@Injectable({
  providedIn: "root",
})
export class FaultDetectionService {
  private detectedFaults: FaultDetection[] = [];
  private isMonitoring: boolean = false;
  private lastScanTime: Date | null = null;
  private faultsSubject = new BehaviorSubject<FaultDetection[]>([]);

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  startBackgroundMonitoring(): void {
    this.isMonitoring = true;

    // Run checks every 30 seconds
    timer(0, 30000).subscribe(() => {
      if (this.isMonitoring) {
        this.runAutomaticCheck();
      }
    });
  }

  stopBackgroundMonitoring(): void {
    this.isMonitoring = false;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
  getBatteryLevel(): number {
    return Math.floor(Math.random() * 81) + 20;
  }
  getFuelLevel(): number {
    return Math.floor(Math.random() * 81) + 20;
  }
  getTemperature(): number {
    return Math.floor(Math.random() * 61) + 20;
  }
  getSignalStrength(): number {
    return Math.floor(Math.random() * 101);
  }

  getLastScanTime(): Date | null {
    return Date.now() ? new Date() : null;
  }

  getDetectedFaults(): FaultDetection[] {
    return [...this.detectedFaults];
  }
  getCriticalFaults(): FaultDetection[] {
    return this.detectedFaults.filter((fault) => fault.severity === "critical");
  }

  getFaultsObservable(): Observable<FaultDetection[]> {
    return this.faultsSubject.asObservable();
  }

  runManualScan(): void {
    this.runAutomaticCheck();
  }

  private runAutomaticCheck(): void {
    this.lastScanTime = new Date();

    // Simulate fault detection logic
    // In a real app, this would check various systems
    this.simulateFaultDetection();

    this.faultsSubject.next([...this.detectedFaults]);
  }

  private simulateFaultDetection(): void {
    // Randomly detect new faults (for demo purposes)
    const shouldDetectFault = Math.random() < 0.1; // 10% chance

    if (shouldDetectFault) {
      const newFault = this.generateRandomFault();
      this.detectedFaults.push(newFault);

      // Keep only last 50 faults
      if (this.detectedFaults.length > 50) {
        this.detectedFaults = this.detectedFaults.slice(-50);
      }
    }
  }

  private generateRandomFault(): FaultDetection {
    const faultTypes = [
      {
        title: "HVAC Temperature Alert",
        description: "Temperature outside normal range in server room",
        location: "Server Room A",
        severity: "high",
      },
      {
        title: "Network Connectivity Issue",
        description: "Intermittent network drops detected",
        location: "Building B - Floor 3",
        severity: "medium",
      },
      {
        title: "Lighting System Fault",
        description: "Emergency lighting not functioning",
        location: "Stairwell C",
        severity: "critical",
      },
      {
        title: "Water Leak Detection",
        description: "Moisture sensors triggered in basement",
        location: "Basement - Storage Area",
        severity: "high",
      },
      {
        title: "Power Supply Warning",
        description: "UPS battery backup running low",
        location: "Data Center",
        severity: "medium",
      },
    ];

    const randomFault =
      faultTypes[Math.floor(Math.random() * faultTypes.length)];

    return {
      id: "fault_" + Date.now(),
      title: randomFault.title,
      description: randomFault.description,
      location: randomFault.location,
      severity: randomFault.severity as any,
      timestamp: new Date(),
      status: "detected",
    };
  }

  private initializeSampleData(): void {
    this.detectedFaults = [
      {
        id: "fault_001",
        title: "HVAC Temperature Alert",
        description: "Server room temperature exceeded 78°F threshold",
        severity: "high",
        location: "Server Room A",
        timestamp: new Date(Date.now() - 30000), // 30 seconds ago
        status: "detected",
      },
      {
        id: "fault_002",
        title: "Hardware Failure",
        description: "Hardware malfunction detected on the tower modem",
        severity: "medium",
        location: "West Tower Modem",
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        status: "investigating",
      },
      {
        id: "fault_003",
        title: "Network Connectivity Issue",
        description: "Intermittent network drops detected",
        location: "Building B - Floor 3",
        severity: "medium",
        timestamp: new Date(Date.now() - 120000),
        status: "detected",
      },
      {
        id: "fault_004",
        title: "Power Supply Warning",
        description: "UPS battery backup running low",
        location: "Data Center",
        severity: "medium",
        timestamp: new Date(Date.now() - 300000),
        status: "detected",
      },
    ];
  }
}
