import { Component, OnInit } from '@angular/core'
import { NetworkService } from '../../services/network.service'

export interface NetworkInfo {
  signalStrength: number
  connectionType: string
  downloadSpeed: number
  uploadSpeed: number
  latency: number
  isConnected: boolean
  timestamp: Date
}

@Component({
  selector: 'ns-signal-detection',
  templateUrl: './signal-detection.component.html',
  styleUrls: ['./signal-detection.component.css']
})
export class SignalDetectionComponent implements OnInit {
  networkInfo: NetworkInfo | null = null
  isTestingSpeed: boolean = false
  testHistory: NetworkInfo[] = []

  constructor(private networkService: NetworkService) {}

  ngOnInit(): void {
    this.loadNetworkInfo()
    this.loadTestHistory()
  }

  loadNetworkInfo(): void {
    this.networkInfo = this.networkService.getCurrentNetworkInfo()
  }

  async runSpeedTest(): Promise<void> {
    this.isTestingSpeed = true
    
    try {
      const result = await this.networkService.runSpeedTest()
      this.networkInfo = result
      this.testHistory.unshift(result)
      
      // Keep only last 10 tests
      if (this.testHistory.length > 10) {
        this.testHistory = this.testHistory.slice(0, 10)
      }
    } catch (error) {
      console.error('Speed test failed:', error)
    } finally {
      this.isTestingSpeed = false
    }
  }

  loadTestHistory(): void {
    this.testHistory = this.networkService.getSpeedTestHistory()
  }

  getSignalStrengthColor(strength: number): string {
    if (strength >= 80) return '#4CAF50'
    if (strength >= 60) return '#8BC34A'
    if (strength >= 40) return '#FFC107'
    if (strength >= 20) return '#FF9800'
    return '#F44336'
  }

  getSignalStrengthText(strength: number): string {
    if (strength >= 80) return 'Excellent'
    if (strength >= 60) return 'Good'
    if (strength >= 40) return 'Fair'
    if (strength >= 20) return 'Poor'
    return 'Very Poor'
  }

  getConnectionTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'wifi': return '📶'
      case '4g': case 'lte': return '📱'
      case '5g': return '🚀'
      case 'ethernet': return '🔌'
      default: return '🌐'
    }
  }

  formatSpeed(speedMbps: number): string {
    return speedMbps.toFixed(1) + ' Mbps'
  }
}