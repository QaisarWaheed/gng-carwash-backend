/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Booking } from '../entities/Booking.entity';
import { CreateBookingDto } from '../dtos/CreateBookingDto';
import { MakeBookingPayment } from '../dtos/MakePayment.dto';
import { UpdateBookingDto } from '../dtos/UpdateBookingDto';

import { CreateReviewDto } from '../dtos/ReviewbookingDto';

import { ResolveFlagDto } from '../dtos/ResolveFlagDto';
import { CreateFlagDto } from 'src/features/user/employee/dto/createFlagDto';
import { Employee } from 'src/features/user/employee/entities/employee.entity';
import { UserAuthService } from 'src/features/user/userAuth/services/userAuth.service';
import { UserAuth } from 'src/features/user/userAuth/entities/userAuth.entity';
import { TIME_SLOTS, BOOKINGS_PER_EMPLOYEE } from '../constants/time-slots.constants';
import { InjectConnection } from '@nestjs/mongoose';
import { AdminService } from 'src/features/Admin/ServicesModule/entities/Services.entity';
import { NotificationsService } from 'src/features/notifications/notifications.service';
import { NotificationType } from 'src/features/notifications/entities/notification.entity';
import { isSameDubaiDay, getDubaiDayStart, getDubaiDayEnd, getDubaiNow, formatDubaiDate } from 'src/utils/timezone.utils';

@Injectable()
export class BookingServiceService {
    constructor(@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
        @InjectModel('Employee') private readonly employeeModel: Model<Employee>,
        @InjectModel('AdminService') private readonly serviceModel: Model<AdminService>,
        private readonly userAuthService: UserAuthService,
        private readonly notificationsService: NotificationsService,
        @InjectConnection() private readonly connection: any

    ) { }


    private async notifyAdminsAndManagers(
        title: string,
        message: string,
        type: NotificationType,
        data: Record<string, any>
    ): Promise<void> {
        try {
            const admins = await this.userAuthService.getAll('Admin');
            const managers = await this.userAuthService.getAll('Manager');
            
            const adminManagers = [...(admins || []), ...(managers || [])];
            
            const notificationPromises = adminManagers.map(user => 
                this.notificationsService.create({
                    userId: user._id.toString(),
                    title,
                    message,
                    type,
                    data
                })
            );
            
            await Promise.allSettled(notificationPromises);
        } catch (error) {
            console.error('Error notifying admins and managers:', error);
        }
    }


    private getOccupiedTimeSlots(startTimeSlot: string, durationMinutes: number): string[] {
        const startIndex = TIME_SLOTS.findIndex(slot => slot.displayTime === startTimeSlot);
        if (startIndex === -1) return [startTimeSlot];

        const occupiedSlots: string[] = [startTimeSlot];
        
        
        const slotsNeeded = Math.ceil(durationMinutes / 75);
        

        for (let i = 1; i < slotsNeeded && (startIndex + i) < TIME_SLOTS.length; i++) {
            occupiedSlots.push(TIME_SLOTS[startIndex + i].displayTime);
        }
        
        return occupiedSlots;
    }


    private async isEmployeeAvailableForDuration(
        employee: Employee,
        date: Date,
        requiredSlots: string[]
    ): Promise<boolean> {
        return requiredSlots.every(slot => {
            const slotAvailability = employee.availabilitySlots.find(
                (s) =>
                    isSameDubaiDay(s.date, date) &&
                    s.timeSlot === slot &&
                    s.isAvailable
            );
            return !!slotAvailability;
        });
    }


    private async checkEmployeeCapacityForSlots(
        employeeId: Types.ObjectId,
        date: Date,
        requiredSlots: string[],
        session?: ClientSession
    ): Promise<boolean> {
        const dateStart = getDubaiDayStart(date);
        const dateEnd = getDubaiDayEnd(date);

        for (const slot of requiredSlots) {
            const bookingCount = await this.bookingModel.countDocuments({
                assignedEmployeeId: employeeId,
                date: { $gte: dateStart, $lte: dateEnd },
                timeSlot: slot,
                status: { $nin: ['cancelled'] }
            }).session(session || null);

            if (bookingCount >= BOOKINGS_PER_EMPLOYEE) {
                return false;
            }
        }
        
        return true;
    }



    async checkTimeSlotAvailability(
        date: Date, 
        timeSlot: string, 
        serviceId?: string
    ): Promise<{
        available: boolean;
        capacity: number;
        currentBookings: number;
        availableEmployees: number;
        requiredSlots?: string[];
    }> {
        let requiredSlots = [timeSlot];
        
    
        if (serviceId && Types.ObjectId.isValid(serviceId)) {
            const service = await this.serviceModel.findById(serviceId);
            if (service && service.estimatedTime) {
                requiredSlots = this.getOccupiedTimeSlots(timeSlot, service.estimatedTime);
            }
        }
        
        
        const availabilities = await Promise.all(
            requiredSlots.map(async (slot) => {
                const availableEmployees = await this.getAvailableEmployeesCount(date, slot);
                const maxCapacity = availableEmployees * BOOKINGS_PER_EMPLOYEE;
                
                const dateStart = getDubaiDayStart(date);
                const dateEnd = getDubaiDayEnd(date);
                
                const currentBookings = await this.bookingModel.countDocuments({
                    date: { $gte: dateStart, $lte: dateEnd },
                    timeSlot: slot,
                    status: { $nin: ['cancelled'] }
                });
                
                return {
                    available: currentBookings < maxCapacity,
                    capacity: maxCapacity,
                    currentBookings,
                    availableEmployees
                };
            })
        );
        
       
        const allAvailable = availabilities.every(a => a.available);
        const minCapacity = Math.min(...availabilities.map(a => a.capacity));
        const maxBookings = Math.max(...availabilities.map(a => a.currentBookings));
        const minEmployees = Math.min(...availabilities.map(a => a.availableEmployees));
        
        return {
            available: allAvailable,
            capacity: minCapacity,
            currentBookings: maxBookings,
            availableEmployees: minEmployees,
            requiredSlots: requiredSlots.length > 1 ? requiredSlots : undefined
        };
    }


 
    async getAvailableTimeSlots(date: Date, serviceId?: string): Promise<Array<{
        timeSlot: string;
        available: boolean;
        capacity: number;
        currentBookings: number;
        status: 'available' | 'limited' | 'full';
        requiredSlots?: string[];
    }>> {
        const slots = await Promise.all(
            TIME_SLOTS.map(async (slot) => {
                const availability = await this.checkTimeSlotAvailability(date, slot.displayTime, serviceId);
                
                let status: 'available' | 'limited' | 'full';
                if (!availability.available) {
                    status = 'full';
                } else if (availability.currentBookings >= availability.capacity * 0.7) {
                    status = 'limited';
                } else {
                    status = 'available';
                }
                
                return {
                    timeSlot: slot.displayTime,
                    available: availability.available,
                    capacity: availability.capacity,
                    currentBookings: availability.currentBookings,
                    status,
                    requiredSlots: availability.requiredSlots
                };
            })
        );
        
        return slots;
    }


    private async getAvailableEmployeesCount(date: Date, timeSlot: string): Promise<number> {
        const employees = await this.employeeModel.find();
        
        console.log(`Checking availability for ${timeSlot} on ${date.toDateString()}`);
        console.log(`Total employees in system: ${employees.length}`);
        
        if (employees.length === 0) {
            console.log('No employees found in system - returning default capacity of 5');
            return 5; 
        }
        
        const availableCount = employees.filter((employee) => {
            const hasAvailabilitySlots = employee.availabilitySlots && employee.availabilitySlots.length > 0;
            
            if (!hasAvailabilitySlots) {
                console.log(`Employee ${employee._id} has no availability slots configured - treating as available`);
                return true; 
            }
            
            const slotAvailability = employee.availabilitySlots.find(
                (slot) =>
                    isSameDubaiDay(slot.date, date) &&
                    slot.timeSlot === timeSlot &&
                    slot.isAvailable
            );
            
            if (slotAvailability) {
                console.log(`Employee ${employee._id} is available for ${timeSlot}`);
            }
            
            return !!slotAvailability;
        }).length;
        
        console.log(`Available employees for ${timeSlot}: ${availableCount}`);
        
        return availableCount;
    }

 


    private async findBestAvailableEmployee(
        date: Date, 
        timeSlot: string, 
        requiredSlots: string[], 
        session?: ClientSession
    ): Promise<Employee | null> {
        const employees = await this.employeeModel.find().session(session || null);
        
     
        const availableEmployees = employees.filter((employee) => {
            const hasAvailabilitySlots = employee.availabilitySlots && employee.availabilitySlots.length > 0;
            
          
            if (!hasAvailabilitySlots) {
                return true;
            }
            
            return requiredSlots.every(slot => {
                const slotAvailability = employee.availabilitySlots.find(
                    (s) =>
                        isSameDubaiDay(s.date, date) &&
                        s.timeSlot === slot &&
                        s.isAvailable
                );
                return !!slotAvailability;
            });
        });

        if (availableEmployees.length === 0) {
            return null;
        }

   
        const employeeBookingCounts = await Promise.all(
            availableEmployees.map(async (emp) => {
        
                const hasCapacity = await this.checkEmployeeCapacityForSlots(
                    emp._id as Types.ObjectId,
                    date,
                    requiredSlots,
                    session
                );
                
                if (!hasCapacity) {
                    return null;
                }
                
             
                const dateStart = new Date(date);
                dateStart.setHours(0, 0, 0, 0);
                const dateEnd = new Date(date);
                dateEnd.setHours(23, 59, 59, 999);
                
                const totalBookings = await this.bookingModel.countDocuments({
                    assignedEmployeeId: emp._id,
                    date: { $gte: dateStart, $lte: dateEnd },
                    status: { $nin: ['cancelled'] }
                }).session(session || null);
                
                return { employee: emp, bookingCount: totalBookings };
            })
        );

       
        const availableWithCapacity = employeeBookingCounts.filter(
            (item) => item !== null
        );

        if (availableWithCapacity.length === 0) {
            return null;
        }


        availableWithCapacity.sort((a, b) => a.bookingCount - b.bookingCount);
        return availableWithCapacity[0].employee;
    }

  
    async createBooking(data: CreateBookingDto): Promise<Booking> {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
           
            const bookingDate = new Date(data.date);
            
            console.log('Creating booking with serviceId:', data.serviceId);
            console.log('ServiceId type:', typeof data.serviceId);
            console.log('Is valid ObjectId:', Types.ObjectId.isValid(data.serviceId));
            
            const service = await this.serviceModel.findById(data.serviceId);
            console.log('Service found:', service ? `${service.name} (${service._id})` : 'null');
            
            if (!service) {
                throw new NotFoundException('Service not found');
            }

            const requiredSlots = this.getOccupiedTimeSlots(data.timeSlot, service.estimatedTime || 60);
            
       
            const availability = await this.checkTimeSlotAvailability(
                bookingDate, 
                data.timeSlot, 
                data.serviceId.toString()
            );
            
            if (!availability.available) {
                const slotsText = requiredSlots.length > 1 
                    ? `time slots (${requiredSlots.join(', ')})` 
                    : `time slot (${data.timeSlot})`;
                throw new BadRequestException(
                    `The selected ${slotsText} ${requiredSlots.length > 1 ? 'are' : 'is'} fully booked. This service requires ${service.estimatedTime} minutes. Please select a different slot.`
                );
            }

          
            const employee = await this.findBestAvailableEmployee(
                bookingDate, 
                data.timeSlot, 
                requiredSlots, 
                session
            );
            
            if (!employee) {
                throw new BadRequestException(
                    `No employees available for ${data.timeSlot} on ${bookingDate.toDateString()}. This service requires ${service.estimatedTime} minutes and needs continuous availability. Please select a different slot.`
                );
            }

          
            const bookingData = {
                ...data,
                assignedEmployeeId: employee._id,
                status: 'confirmed' as const
            };

            const newBooking = await this.bookingModel.create([bookingData], { session });

        
            await this.employeeModel.findByIdAndUpdate(
                employee._id,
                { $addToSet: { assignedBookings: newBooking[0]._id } },
                { session }
            );

       
            for (const slot of requiredSlots) {
                const dateStart = getDubaiDayStart(bookingDate);
                const dateEnd = getDubaiDayEnd(bookingDate);
                
                const employeeBookingsCount = await this.bookingModel.countDocuments({
                    assignedEmployeeId: employee._id,
                    date: { $gte: dateStart, $lte: dateEnd },
                    timeSlot: slot,
                    status: { $nin: ['cancelled'] }
                }).session(session);

              
                if (employeeBookingsCount >= BOOKINGS_PER_EMPLOYEE) {
                    const slotIndex = employee.availabilitySlots.findIndex(
                        (s) =>
                            isSameDubaiDay(s.date, bookingDate) &&
                            s.timeSlot === slot
                    );

                    if (slotIndex !== -1) {
                        employee.availabilitySlots[slotIndex].isAvailable = false;
                        await employee.save({ session });
                    }
                }
            }

            await session.commitTransaction();
            
          
            try {
               
                const customer = await this.userAuthService.getById(data.customerId);
                const customerName = (customer && 'fullName' in customer) ? customer.fullName : 'Customer';
                
                await this.notificationsService.create({
                    userId: data.customerId,
                    title: 'Booking Confirmed',
                    message: `Your ${service.name} booking for ${bookingDate.toLocaleDateString()} at ${data.timeSlot} has been confirmed.`,
                    type: NotificationType.BOOKING_CONFIRMED,
                    data: {
                        bookingId: newBooking[0]._id.toString(),
                        date: bookingDate,
                        timeSlot: data.timeSlot,
                        serviceName: service.name
                    }
                });

               
                const employeeUser = await this.userAuthService.getById(employee.userId.toString());
                if (employeeUser) {
                    await this.notificationsService.create({
                        userId: employee.userId.toString(),
                        title: 'New Job Assigned',
                        message: `You have been assigned a ${service.name} job on ${bookingDate.toLocaleDateString()} at ${data.timeSlot}.`,
                        type: NotificationType.JOB_ASSIGNED,
                        data: {
                            bookingId: newBooking[0]._id.toString(),
                            date: bookingDate,
                            timeSlot: data.timeSlot,
                            serviceName: service.name
                        }
                    });
                }

                
                await this.notifyAdminsAndManagers(
                    'New Booking Created',
                    `New ${service.name} booking by ${customerName} for ${bookingDate.toLocaleDateString()} at ${data.timeSlot}.`,
                    NotificationType.BOOKING_CONFIRMED,
                    {
                        bookingId: newBooking[0]._id.toString(),
                        date: bookingDate,
                        timeSlot: data.timeSlot,
                        serviceName: service.name,
                        customerName: customerName
                    }
                );
            } catch (notifError) {
                console.error('Error creating booking notifications:', notifError);
               
            }
            
            return newBooking[0];
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getAvailableEmployees(date: Date, timeSlot: string): Promise<any[]> {
        const employees = await this.employeeModel.find();
        
        const availableEmployees = employees.filter((employee) => {
            const slotAvailability = employee.availabilitySlots.find(
                (slot) =>
                    isSameDubaiDay(slot.date, date) &&
                    slot.timeSlot === timeSlot &&
                    slot.isAvailable
            );
            return !!slotAvailability;
        });

        return availableEmployees.map((emp) => ({
            _id: emp._id,
            userId: emp.userId,
            completedJobs: emp.completedJobs,
        }));
    }

    async getAllBooking(): Promise<Booking[]> {
        const allBooking = await this.bookingModel.find()
            .populate('customerId', 'fullName email phone')
            .populate('vehicleId', 'make model')
            .populate('serviceId', 'name price')
            .populate('services', 'name price')
            .populate('addressId', 'street city')
            .populate('assignedEmployeeId', 'fullName email phoneNumber')
            .sort({ createdAt: -1 })
            .exec();
        return allBooking;
    }


    async getBookingById(id: string): Promise<Booking> {
        const getByID = await this.bookingModel.findOne({ _id: id });
        if (!getByID) {
            throw new NotFoundException("booking not found")
        }

        return getByID
    }


    async getBookingByUserId(id: string): Promise<Booking[] | { message: string }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid User ID');
        }
        console.log('Searching for bookings with customerId:', id);
        
        const bookings = await this.bookingModel.find({ customerId: id })
            .populate('customerId')
            .populate('vehicleId')
            .populate('serviceId')
            .populate('addressId')
            .populate('assignedEmployeeId');
        
        console.log('Bookings found:', bookings.length);
            
        if (!bookings || bookings.length === 0) {
            return [];
        }
        return bookings;
    }

    async getEmployeeBookings(employeeId: string): Promise<Booking[]> {
        if (!Types.ObjectId.isValid(employeeId)) {
            throw new BadRequestException('Invalid Employee ID');
        }

        console.log('Fetching bookings for employee ID:', employeeId);

       
        const employee = await this.employeeModel.findOne({ userId: employeeId });
        
       
        const searchIds: Types.ObjectId[] = [new Types.ObjectId(employeeId)];
        if (employee && employee._id) {
            searchIds.push(employee._id as Types.ObjectId);
            console.log('Found employee record with _id:', employee._id);
        }

        const bookings = await this.bookingModel.find({ 
            assignedEmployeeId: { $in: searchIds },
            status: { $nin: ['cancelled'] }
        })
            .populate('customerId', 'fullName email phoneNumber')
            .populate('vehicleId', 'make model plateNumber type subType color')
            .populate('serviceId', 'name price duration')
            .populate('addressId', 'building apartment streetAddress area city emirate state zipCode landmark')
            .sort({ date: 1, timeSlot: 1 })
            .exec();
        
        console.log('Found bookings:', bookings.length);
        return bookings;
    }

    async ManagerUpdateBookingStatus(id: string, data: UpdateBookingDto): Promise<Booking | null> {
        const booking = await this.bookingModel.findById(id).populate('customerId serviceId');
        if (!booking) return null;

        const update = await this.bookingModel.findByIdAndUpdate(id, data, { new: true });
        
        // Send notification to customer about status change
        if (update && data.status && booking.status !== data.status) {
            try {
                const statusMessages = {
                    'confirmed': 'Your booking has been confirmed.',
                    'in-progress': 'Your service is now in progress.',
                    'completed': 'Your service has been completed.',
                    'cancelled': 'Your booking has been cancelled.',
                };

                await this.notificationsService.create({
                    userId: booking.customerId.toString(),
                    title: 'Booking Status Updated',
                    message: statusMessages[data.status] || `Your booking status has been updated to ${data.status}.`,
                    type: NotificationType.STATUS_CHANGED,
                    data: {
                        bookingId: id,
                        newStatus: data.status,
                        oldStatus: booking.status
                    }
                });

                
                await this.notifyAdminsAndManagers(
                    'Booking Status Changed',
                    `Booking #${id} status changed from ${booking.status} to ${data.status} by manager.`,
                    NotificationType.STATUS_CHANGED,
                    {
                        bookingId: id,
                        newStatus: data.status,
                        oldStatus: booking.status,
                        changedBy: 'manager'
                    }
                );
            } catch (notifError) {
                console.error('Error creating status update notification:', notifError);
            }
        }
        
        return update;
    }

    async EmployeeupdateBookingStatus(id: string, data: UpdateBookingDto): Promise<Booking | null> {
        const booking = await this.bookingModel.findById(id).populate('customerId serviceId');
        if (!booking) return null;

        const update = await this.bookingModel.findByIdAndUpdate(id, data, { new: true });
        
       
        if (update && data.status && booking.status !== data.status) {
            try {
                const statusMessages = {
                    'confirmed': 'Your booking has been confirmed.',
                    'in-progress': 'Your service is now in progress.',
                    'completed': 'Your service has been completed. Thank you!',
                    'cancelled': 'Your booking has been cancelled.',
                };

                await this.notificationsService.create({
                    userId: booking.customerId.toString(),
                    title: 'Booking Status Updated',
                    message: statusMessages[data.status] || `Your booking status has been updated to ${data.status}.`,
                    type: NotificationType.STATUS_CHANGED,
                    data: {
                        bookingId: id,
                        newStatus: data.status,
                        oldStatus: booking.status
                    }
                });

                
                await this.notifyAdminsAndManagers(
                    'Booking Status Changed',
                    `Booking #${id} status changed from ${booking.status} to ${data.status} by employee.`,
                    NotificationType.STATUS_CHANGED,
                    {
                        bookingId: id,
                        newStatus: data.status,
                        oldStatus: booking.status,
                        changedBy: 'employee'
                    }
                );
            } catch (notifError) {
                console.error('Error creating status update notification:', notifError);
            }
        }
        
        return update;
    }

    async rescheduleBooking(id: string, date: string, timeSlot: string, reason?: string): Promise<Booking> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Booking ID');
        }

        const booking = await this.bookingModel.findById(id);
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            throw new BadRequestException(`Cannot reschedule a ${booking.status} booking`);
        }

        const newBookingDate = new Date(date);
        const dubaiToday = getDubaiDayStart(getDubaiNow());
        const dubaiNewDate = getDubaiDayStart(newBookingDate);
        
        if (dubaiNewDate < dubaiToday) {
            throw new BadRequestException('Cannot reschedule to a past date');
        }

        const oldDate = booking.date;
        const oldTimeSlot = booking.timeSlot;
        
        booking.date = newBookingDate;
        booking.timeSlot = timeSlot;
        
        if (reason) {
            booking.additionalNotes = booking.additionalNotes 
                ? `${booking.additionalNotes}\n[Rescheduled on ${new Date().toISOString()}]: ${reason}`
                : `[Rescheduled on ${new Date().toISOString()}]: ${reason}`;
        }

        await booking.save();

       
        try {
            await this.notificationsService.create({
                userId: booking.customerId.toString(),
                title: 'Booking Rescheduled',
                message: `Your booking has been rescheduled from ${new Date(oldDate).toLocaleDateString()} at ${oldTimeSlot} to ${newBookingDate.toLocaleDateString()} at ${timeSlot}.${reason ? ` Reason: ${reason}` : ''}`,
                type: NotificationType.BOOKING_RESCHEDULED,
                data: {
                    bookingId: id,
                    oldDate,
                    oldTimeSlot,
                    newDate: newBookingDate,
                    newTimeSlot: timeSlot,
                    reason
                }
            });

           
            if (booking.assignedEmployeeId) {
                const employee = await this.employeeModel.findById(booking.assignedEmployeeId);
                if (employee) {
                    await this.notificationsService.create({
                        userId: employee.userId.toString(),
                        title: 'Job Rescheduled',
                        message: `A job has been rescheduled from ${new Date(oldDate).toLocaleDateString()} at ${oldTimeSlot} to ${newBookingDate.toLocaleDateString()} at ${timeSlot}.`,
                        type: NotificationType.BOOKING_RESCHEDULED,
                        data: {
                            bookingId: id,
                            oldDate,
                            oldTimeSlot,
                            newDate: newBookingDate,
                            newTimeSlot: timeSlot
                        }
                    });
                }
            }

           
            await this.notifyAdminsAndManagers(
                'Booking Rescheduled',
                `Booking #${id} rescheduled from ${new Date(oldDate).toLocaleDateString()} at ${oldTimeSlot} to ${newBookingDate.toLocaleDateString()} at ${timeSlot}.`,
                NotificationType.BOOKING_RESCHEDULED,
                {
                    bookingId: id,
                    oldDate,
                    oldTimeSlot,
                    newDate: newBookingDate,
                    newTimeSlot: timeSlot,
                    reason
                }
            );
        } catch (notifError) {
            console.error('Error creating reschedule notifications:', notifError);
        }

        return booking;
    }



    async assignEmployee(bookingId: string, employeeId: string): Promise<Booking | null> {
        let employee = await this.employeeModel.findById(employeeId);
        
        if (!employee) {
            employee = await this.employeeModel.findOne({ userId: employeeId });
        }
        
        if (!employee) {
            const userAuth = await this.userAuthService.getById(employeeId) as UserAuth;
            
            if (!userAuth || userAuth.role !== 'Employee') {
                throw new NotFoundException("Employee not found. The user may not have an employee profile or is not an employee.");
            }
            
            employee = await this.employeeModel.create({
                userId: employeeId,
                assignedBookings: [],
                completedJobs: 0,
                availabilitySlots: [],
                reviews: [],
                flags: [],
            });
            
            console.log('Auto-created employee profile for UserAuth:', employeeId);
        }

        const booking = await this.bookingModel.findById(bookingId);
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

    
        let slotAvailability = employee.availabilitySlots?.find(
            (slot) =>
                isSameDubaiDay(slot.date, booking.date) &&
                slot.timeSlot === booking.timeSlot
        );

    
        if (!slotAvailability && (!employee.availabilitySlots || employee.availabilitySlots.length === 0)) {
            employee.availabilitySlots = employee.availabilitySlots || [];
            slotAvailability = {
                date: new Date(booking.date),
                timeSlot: booking.timeSlot,
                isAvailable: true
            };
            employee.availabilitySlots.push(slotAvailability);
        }

        if (!slotAvailability) {
            throw new BadRequestException(
                `Employee is not available on ${formatDubaiDate(booking.date)} at ${booking.timeSlot}. Please select a different slot or employee.`
            );
        }

        if (!slotAvailability.isAvailable) {
            throw new BadRequestException(
                `The selected slot (${booking.timeSlot} on ${booking.date}) is not available. Please select a different slot.`
            );
        }

      
        slotAvailability.isAvailable = false;
        await employee.save();

        const wasAlreadyAssigned = !!booking.assignedEmployeeId;
        booking.assignedEmployeeId = new Types.ObjectId(employeeId);
        booking.status = "confirmed";
        await booking.save();

        await this.employeeModel.findByIdAndUpdate(
            employeeId,
            { $addToSet: { assignedBookings: booking._id } },
            { new: true }
        );

       
        if (!wasAlreadyAssigned) {
            try {
                const populatedBooking = await this.bookingModel.findById(booking._id).populate('serviceId');
                await this.notificationsService.create({
                    userId: employee.userId.toString(),
                    title: 'New Job Assigned',
                    message: `You have been assigned a job on ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}.`,
                    type: NotificationType.JOB_ASSIGNED,
                    data: {
                        bookingId: bookingId,
                        date: booking.date,
                        timeSlot: booking.timeSlot,
                        serviceName: populatedBooking?.serviceId?.['name'] || 'Service'
                    }
                });

               
                await this.notifyAdminsAndManagers(
                    'Employee Assigned to Booking',
                    `Employee has been assigned to booking #${bookingId} for ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}.`,
                    NotificationType.EMPLOYEE_ASSIGNED,
                    {
                        bookingId: bookingId,
                        employeeId: employeeId,
                        date: booking.date,
                        timeSlot: booking.timeSlot,
                        serviceName: populatedBooking?.serviceId?.['name'] || 'Service'
                    }
                );
            } catch (notifError) {
                console.error('Error creating employee assignment notification:', notifError);
            }
        }

        return this.bookingModel
            .findById(booking._id)
            .populate('assignedEmployeeId', 'name email')
            .populate('customerId', 'name email');
    }


    async makePayment(id: string, data: MakeBookingPayment): Promise<{ message: string }> {
        const booking = await this.getBookingById(id);

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.status !== 'completed') {
            return { message: 'Booking is still in progress' };
        }

        const updatedBooking = await this.bookingModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    paymentStatus: data.paymentStatus || 'Paid',
                    paymentMethod: data.paymentMethod,
                    paidAt: new Date(),
                },
            },
            { new: true }
        );

        if (!updatedBooking) {
            throw new NotFoundException('No Booking found against this ID');
        }

        return { message: 'Payment Successful' };
    }

    async addReview(bookingId: string, dto: CreateReviewDto) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status !== 'completed')
            throw new BadRequestException('You can only review completed bookings');

        if (booking.isReviewed) {
            throw new BadRequestException('This booking has already been reviewed');
        }


        const employeeId = booking.assignedEmployeeId;
        if (!employeeId) throw new BadRequestException('No employee assigned to this booking');





        await this.employeeModel.findOneAndUpdate(
            { _id: employeeId },
            {
                $push: {
                    reviews: {
                        bookingId: booking._id,
                        rating: dto.rating,
                        review: dto.review,
                    },
                },
            },
            { new: true },
        );

        if (dto.rating < 3) {
            const flag: CreateFlagDto = {
                bookingId: booking._id.toString(),
                reason: `Low customer rating (${dto.rating} stars)`,
                issuedBy: dto.customerId,
            };

            await this.employeeModel.findOneAndUpdate(
                { _id: employeeId },
                { $push: { flags: flag } },
            );
        }

        booking.isReviewed = true;
        await booking.save();

        return { message: 'Review submitted successfully' };
    }


    async resolveFlag(employeeId: string, flagIndex: number, dto: ResolveFlagDto) {
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee) throw new NotFoundException('Employee not found');

        if (!employee.flags[flagIndex]) {
            throw new NotFoundException('Flag not found');
        }

        employee.flags[flagIndex].resolved = dto.resolved;
        if (dto.resolved) {
            employee.flags[flagIndex].resolvedAt = new Date();
            if (dto.resolvedBy)
                employee.flags[flagIndex].resolvedBy = new Types.ObjectId(dto.resolvedBy);
        } else {
            employee.flags[flagIndex].resolvedAt = undefined;
            employee.flags[flagIndex].resolvedBy = undefined;
        }

        await employee.save();

        return {
            message: `Flag #${flagIndex + 1} ${dto.resolved ? 'marked as resolved' : 'reopened'
                } successfully.`,
            employee,
        };
    }

    async deleteBooking(id: string): Promise<{ message: string } | null> {
        try {
            const deleteBooking = await this.bookingModel.findByIdAndDelete(id)
            if (!deleteBooking) {
                throw new NotFoundException("Booking Not Found")
            }
            return { message: " Booking Deleted" }
        }
        catch (error) {
            return { message: "Invalid Id" }
        }

    }

}
