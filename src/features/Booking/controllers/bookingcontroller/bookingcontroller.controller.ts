/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, NotFoundException, Param, Post, Put, UseGuards, Query } from '@nestjs/common';
import { BookingServiceService } from '../../booking-service/booking-service.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '../../dtos/CreateBookingDto';
import { AuthGuardWithRoles } from 'src/guards/authGuart';
import { Roles } from 'src/decorators/Roles.decorator';
import { Role } from 'src/types/enum.class';
import { AssignEmployeeDto } from '../../dtos/AssignEmployeeDto';
import { MakeBookingPayment } from '../../dtos/MakePayment.dto';
import { UpdateBookingDto } from '../../dtos/UpdateBookingDto';
import { CreateReviewDto } from '../../dtos/ReviewbookingDto';
import { ResolveFlagDto } from '../../dtos/ResolveFlagDto';
import { Types } from 'mongoose';
import { CheckAvailabilityDto } from '../../dtos/CheckAvailabilityDto';
import { TIME_SLOTS } from '../../constants/time-slots.constants';

@ApiTags("Booking")
@ApiBearerAuth()
@Controller('booking')

export class BookingController {
    private readonly logger = new Logger(BookingController.name);
    constructor(private readonly bookingServiceService: BookingServiceService) { }

    /**
     * Get all available time slots with capacity info
     * Optional: Pass serviceId to filter based on service duration
     */
    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.User)
    @Get('available-slots')
    async getAvailableTimeSlots(
        @Query('date') date: string,
        @Query('serviceId') serviceId?: string
    ) {
        try {
            if (!date) {
                throw new BadRequestException('Date is required');
            }
            const bookingDate = new Date(date);
            return await this.bookingServiceService.getAvailableTimeSlots(bookingDate, serviceId);
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all time slots configuration
     */
    @Get('time-slots')
    async getAllTimeSlots() {
        return TIME_SLOTS;
    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Manager, Role.Admin)
    @Get('all')
    async getAllBooking() {
        try {
            return await this.bookingServiceService.getAllBooking()
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.NOT_FOUND)
        }
    }


    // Temporarily remove guard for debugging
    // @UseGuards(AuthGuardWithRoles)
    // @Roles(Role.User)
    @Get('user-bookings/:userId')
    async getAllBookingsByUserId(@Param('userId') userId: string) {
        console.log('getAllBookingsByUserId called with userId:', userId);
        try {
            const bookings = await this.bookingServiceService.getBookingByUserId(userId);
            console.log('Found bookings:', Array.isArray(bookings) ? bookings.length : 0);
            if (!bookings) return [];
            return bookings;
        }
        catch (e) {
            console.error('Error in getAllBookingsByUserId:', e);
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }



    @Get(':id')
    async getBookingById(@Param('id') id: string) {
        this.logger.log(`Controller reached with id: ${id}`);
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('Invalid booking ID');
            }

            const booking = await this.bookingServiceService.getBookingById(id)
            if (!booking) {
                throw new NotFoundException(`Booking with Id: ${id} not found`)
            }
            return booking
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }


    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.User)
    @Post()
    async createNewBooking(@Body() data: CreateBookingDto) {
        try {
            console.log('Creating booking for customerId:', data.customerId);
            const booking = await this.bookingServiceService.createBooking(data);
            console.log('Booking created successfully with ID:', booking._id);
            console.log('Booking customerId:', booking.customerId);
            return booking;
        }
        catch (e) {
            console.error('Error creating booking:', e.message);
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }



    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Admin, Role.Manager)
    @Put('assignEmployee/:bookingId')
    async assignEmployee(@Param('bookingId') bookingId: string, @Body() data: AssignEmployeeDto) {
        try {
            return await this.bookingServiceService.assignEmployee(bookingId, data.assignedEmployeeId)
        }
        catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }


    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Employee)
    @Get('employee/my-bookings/:employeeId')
    async getEmployeeBookings(@Param('employeeId') employeeId: string) {
        try {
            this.logger.log(`Fetching bookings for employee: ${employeeId}`);
            const bookings = await this.bookingServiceService.getEmployeeBookings(employeeId);
            this.logger.log(`Found ${bookings.length} bookings`);
            return bookings;
        }
        catch (e) {
            this.logger.error(`Error fetching employee bookings: ${e.message}`);
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Employee)
    @Put('employee/update-booking-status/:id')
    async employeeupdateBooking(@Param('id') id: string, @Body() data: UpdateBookingDto) {
        try {
            return await this.bookingServiceService.EmployeeupdateBookingStatus(id, data)
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Manager)
    @Put('manager/update-booking-status/:id')
    async managerUpdateBooking(@Param('id') id: string, @Body() data: UpdateBookingDto) {
        try {
            return await this.bookingServiceService.EmployeeupdateBookingStatus(id, data)
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Manager || Role.Admin)
    @Put('reschedule/:id')
    async rescheduleBooking(@Param('id') id: string, @Body() data: { date: string; timeSlot: string; reason?: string }) {
        try {
            return await this.bookingServiceService.rescheduleBooking(id, data.date, data.timeSlot, data.reason);
        }
        catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }


    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.User)
    @Put('/make-payment/:id')
    async makePayment(@Param('id') id: string, @Body() data: MakeBookingPayment) {
        try {
            return await this.bookingServiceService.makePayment(id, data)

        }
        catch (e) {
            throw new BadRequestException(e.message)
        }
    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.User)
    @Put('review/:bookingId')
    async giveReview(@Param('bookingId') bookingId: string, @Body() data: CreateReviewDto) {

        const review = await this.bookingServiceService.addReview(bookingId, data)
        return review

    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Manager)
    @Put('resolve-flag/:employeeId')
    async resolveFlag(@Param('employeeId') employeeId: string, flagIndex: number, @Body() dto: ResolveFlagDto) {
        const flagResolved = await this.bookingServiceService.resolveFlag(employeeId, flagIndex, dto)
        return flagResolved
    }


    @Delete(':id')
    async deleteBooking(@Param('id') id: string) {
        try {
            return await this.bookingServiceService.deleteBooking(id)
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }


}
