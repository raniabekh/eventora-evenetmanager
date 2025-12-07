// src/app/components/shared/notification-badge/notification-badge.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-badge" *ngIf="unreadCount > 0">
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </div>
  `,
  styles: [`
    .notification-badge {
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
  `]
})
export class NotificationBadgeComponent implements OnInit {
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }
}
