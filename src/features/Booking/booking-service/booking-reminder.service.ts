import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../entities/Booking.entity';
import { NotificationsService } from 'src/features/notifications/notifications.service';
import { NotificationType } from 'src/features/notifications/entities/notification.entity';
import { Employee } from 'src/features/user/employee/entities/employee.entity';
import { getDubaiNow, toDubaiTime } from 'src/utils/timezone.utils';

@Injectable()
export class BookingReminderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingReminderService.name);
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel('Booking') private readonly bookingModel: Model<Booking>,
    @InjectModel('Employee') private readonly employeeModel: Model<Employee>,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
   
    this.intervalHandle = setInterval(() => this.checkAndSendReminders(), 60 * 1000);
    this.logger.log('BookingReminderService started (checking every 60s)');
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.logger.log('BookingReminderService stopped');
  }

  private async checkAndSendReminders() {
    try {
      const now = getDubaiNow();
   
      const daysAhead = 1; 
      const startRange = new Date(now.getTime() - 60 * 60 * 1000); 
      const endRange = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const bookings = await this.bookingModel
        .find({
          status: 'confirmed',
          reminderNotified: { $ne: true },
          assignedEmployeeId: { $ne: null },
          date: { $gte: startRange, $lte: endRange },
        })
        .exec();

      for (const booking of bookings) {
        try {
          const timeSlot = booking.timeSlot || '';
          const [hoursStr, minutesStr] = timeSlot.split(':');
          const hours = Number(hoursStr || 0);
          const minutes = Number(minutesStr || 0);

          const scheduled = toDubaiTime(booking.date);
          scheduled.setHours(hours, minutes, 0, 0);

          const diffMs = scheduled.getTime() - now.getTime();
          const diffMins = diffMs / (60 * 1000);

        
          if (diffMins >= 14.5 && diffMins <= 15.5) {
           
            try {
              await this.notificationsService.create({
                userId: String(booking.customerId),
                title: 'Upcoming Booking',
                message: `Your booking is scheduled at ${timeSlot} — starting in 15 minutes.`,
                type: NotificationType.APPOINTMENT_REMINDER as any,
                data: { bookingId: String(booking._id) },
              });
            } catch (e) {
              this.logger.error('Failed to create customer reminder', e as any);
            }

           
            try {
              const employee = await this.employeeModel.findById(booking.assignedEmployeeId).exec();
              if (employee && employee.userId) {
                await this.notificationsService.create({
                  userId: String(employee.userId),
                  title: 'Upcoming Job',
                  message: `You have a job scheduled at ${timeSlot} — starting in 15 minutes.`,
                  type: NotificationType.APPOINTMENT_REMINDER as any,
                  data: { bookingId: String(booking._id) },
                });
              }
            } catch (e) {
              this.logger.error('Failed to create employee reminder', e as any);
            }

          
            try {
              booking.reminderNotified = true as any;
              booking.reminderSentAt = new Date();
              await booking.save();
            } catch (e) {
              this.logger.error('Failed to mark booking as reminded', e as any);
            }
          }
        } catch (inner) {
          this.logger.error('Error processing booking for reminders', inner as any);
        }
      }
    } catch (err) {
      this.logger.error('Error in checkAndSendReminders loop', err as any);
    }
  }
}
