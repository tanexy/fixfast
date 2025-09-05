import { Injectable } from '@angular/core'
import { connectionType, getConnectionType } from '@nativescript/core/connectivity'

export interface NetworkInfo {
  signalStrength: number
  connectionType: string
  downloadSpeed: number
  uploadSpeed: number
  latency: number
  isConnected: boolean
  timestamp: Date
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private speedTestHistory: NetworkInfo[] = []

  constructor() {
    this.initializeSampleHistory()
  }

  getCurrentNetworkInfo(): NetworkInfo {
    const connType = getConnectionType()
    
    return {
      signalStrength: this.getSignalStrength(),
      connectionType: this.getConnectionTypeString(connType),
      downloadSpeed: 0, // Will be updated by speed test
      uploadSpeed: 0,   // Will be updated by speed test
      latency: 0,       // Will be updated by speed test
      isConnected: connType !== connectionType.none,
      timestamp: new Date()
    }
  }

  async runSpeedTest(): Promise<NetworkInfo> {
    // Simulate speed test (in a real app, this would make actual network requests)
    const testDuration = 5000 // 5 seconds
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const result: NetworkInfo = {
          ...this.getCurrentNetworkInfo(),
          downloadSpeed: this.simulateDownloadSpeed(),
          uploadSpeed: this.simulateUploadSpeed(),
          latency: this.simulateLatency(),
          timestamp: new Date()
        }
        
        // Add to history
        this.speedTestHistory.unshift(result)
        if (this.speedTestHistory.length > 20) {
          this.speedTestHistory = this.speedTestHistory.slice(0, 20)
        }
        
        resolve(result)
      }, testDuration)
    })
  }

  getSpeedTestHistory(): NetworkInfo[] {
    return [...this.speedTestHistory]
  }

  private getSignalStrength(): number {
    // Simulate signal strength (in a real app, this would use device APIs)
    return Math.floor(Math.random() * 40) + 60 // 60-100%
  }

  private getConnectionTypeString(connType: connectionType): string {
    switch (connType) {
      case connectionType.wifi: return 'WiFi'
      case connectionType.mobile: return '4G/LTE'
      case connectionType.ethernet: return 'Ethernet'
      case connectionType.bluetooth: return 'Bluetooth'
      default: return 'Unknown'
    }
  }

  private simulateDownloadSpeed(): number {
    // Simulate realistic download speeds (Mbps)
    const connType = getConnectionType()
    
    if (connType === connectionType.wifi) {
      return Math.random() * 80 + 20 // 20-100 Mbps
    } else if (connType === connectionType.mobile) {
      return Math.random() * 40 + 10 // 10-50 Mbps
    } else {
      return Math.random() * 10 + 1 // 1-11 Mbps
    }
  }

  private simulateUploadSpeed(): number {
    // Upload is typically slower than download
    const downloadSpeed = this.simulateDownloadSpeed()
    return downloadSpeed * (Math.random() * 0.5 + 0.3) // 30-80% of download
  }

  private simulateLatency(): number {
    const connType = getConnectionType()
    
    if (connType === connectionType.wifi) {
      return Math.floor(Math.random() * 20) + 10 // 10-30ms
    } else if (connType === connectionType.mobile) {
      return Math.floor(Math.random() * 50) + 30 // 30-80ms
    } else {
      return Math.floor(Math.random() * 100) + 50 // 50-150ms
    }
  }

  private initializeSampleHistory(): void {
    // Add some sample test history
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(Date.now() - i * 3600000) // Every hour
      this.speedTestHistory.push({
        signalStrength: Math.floor(Math.random() * 40) + 60,
        connectionType: 'WiFi',
        downloadSpeed: Math.random() * 80 + 20,
        uploadSpeed: Math.random() * 30 + 10,
        latency: Math.floor(Math.random() * 20) + 10,
        isConnected: true,
        timestamp: timestamp
      })
    }
  }
}