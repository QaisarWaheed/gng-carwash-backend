/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
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

@ApiTags("Booking")
@ApiBearerAuth()
@Controller('booking')

export class BookingController {
    private readonly logger = new Logger(BookingController.name);
    constructor(private readonly bookingServiceService: BookingServiceService) { }


    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Manager || Role.Admin)
    @Get()
    async getAllBooking() {
        try {
            return await this.bookingServiceService.getAllBooking()
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.NOT_FOUND)
        }
    }


    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.User)
    @Get('user-bookings/:userId')
    async getAllBookingsByUserId(@Param('userId') userId: string) {
        try {
            return await this.bookingServiceService.getBookingByUserId(userId);
        }
        catch (e) {
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
            return await this.bookingServiceService.createBooking(data)
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }



    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Manager)
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
