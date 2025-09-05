import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs'

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
  attachments?: string[]
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private tickets: Ticket[] = []
  private ticketsSubject = new BehaviorSubject<Ticket[]>([])

  constructor() {
    this.initializeSampleData()
  }

  getTickets(): Observable<Ticket[]> {
    return this.ticketsSubject.asObservable()
  }

  getTicketsByUser(userEmail: string): Observable<Ticket[]> {
    const userTickets = this.tickets.filter(ticket => ticket.reportedBy === userEmail)
    return new BehaviorSubject(userTickets).asObservable()
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find(ticket => ticket.id === id)
  }

  async createTicket(reportData: any): Promise<Ticket> {
    const newTicket: Ticket = {
      id: 'ticket_' + Date.now(),
      title: reportData.title,
      description: reportData.description,
      status: 'open',
      priority: reportData.severity,
      location: reportData.location,
      reportedBy: reportData.reporterContact || 'Anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: reportData.attachments || []
    }

    this.tickets.unshift(newTicket)
    this.ticketsSubject.next([...this.tickets])

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return newTicket
  }

  async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<void> {
    const ticket = this.getTicketById(ticketId)
    if (ticket) {
      ticket.status = status
      ticket.updatedAt = new Date()
      this.ticketsSubject.next([...this.tickets])
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  async assignTicket(ticketId: string, assignee: string): Promise<void> {
    const ticket = this.getTicketById(ticketId)
    if (ticket) {
      ticket.assignedTo = assignee
      ticket.updatedAt = new Date()
      this.ticketsSubject.next([...this.tickets])
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private initializeSampleData(): void {
    this.tickets = [
      {
        id: 'ticket_001',
        title: 'Air Conditioning Not Working',
        description: 'The AC unit in conference room B is not cooling properly. Temperature is consistently above 80°F.',
        status: 'in-progress',
        priority: 'high',
        location: 'Conference Room B - Floor 3',
        assignedTo: 'Mike Johnson',
        reportedBy: 'sarah.connor@company.com',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 3600000)   // 1 hour ago
      },
      {
        id: 'ticket_002',
        title: 'Flickering Light in Hallway',
        description: 'Fluorescent light in the main hallway keeps flickering intermittently.',
        status: 'open',
        priority: 'medium',
        location: 'Main Hallway - Floor 2',
        reportedBy: 'john.smith@company.com',
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
        updatedAt: new Date(Date.now() - 43200000)
      },
      {
        id: 'ticket_003',
        title: 'Water Cooler Empty',
        description: 'The water cooler near the break room has been empty for two days.',
        status: 'resolved',
        priority: 'low',
        location: 'Break Room - Floor 1',
        assignedTo: 'Lisa Chen',
        reportedBy: 'emma.davis@company.com',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 7200000)    // 2 hours ago
      }
    ]

    this.ticketsSubject.next([...this.tickets])
  }
}