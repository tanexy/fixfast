import { Component, OnInit } from '@angular/core'
import { TicketService } from '../../services/ticket.service'

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  location: string
  assignedTo?: string
  reportedBy: string
  createdAt: Date
  updatedAt: Date
}

@Component({
  selector: 'ns-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = []
  filteredTickets: Ticket[] = []
  selectedStatus: string = 'all'
  
  statusOptions = [
    { key: 'all', display: 'All Tickets', count: 0 },
    { key: 'open', display: 'Open', count: 0 },
    { key: 'in-progress', display: 'In Progress', count: 0 },
    { key: 'resolved', display: 'Resolved', count: 0 },
    { key: 'closed', display: 'Closed', count: 0 }
  ]

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets()
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe(tickets => {
      this.tickets = tickets
      this.updateStatusCounts()
      this.filterTickets()
    })
  }

  filterTickets(): void {
    if (this.selectedStatus === 'all') {
      this.filteredTickets = [...this.tickets]
    } else {
      this.filteredTickets = this.tickets.filter(ticket => ticket.status === this.selectedStatus)
    }
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status
    this.filterTickets()
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return '#F44336'
      case 'in-progress': return '#FF9800'
      case 'resolved': return '#4CAF50'
      case 'closed': return '#9E9E9E'
      default: return '#2196F3'
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return '#D32F2F'
      case 'high': return '#F57C00'
      case 'medium': return '#FBC02D'
      case 'low': return '#388E3C'
      default: return '#616161'
    }
  }

  private updateStatusCounts(): void {
    this.statusOptions[0].count = this.tickets.length // all
    this.statusOptions[1].count = this.tickets.filter(t => t.status === 'open').length
    this.statusOptions[2].count = this.tickets.filter(t => t.status === 'in-progress').length
    this.statusOptions[3].count = this.tickets.filter(t => t.status === 'resolved').length
    this.statusOptions[4].count = this.tickets.filter(t => t.status === 'closed').length
  }
}