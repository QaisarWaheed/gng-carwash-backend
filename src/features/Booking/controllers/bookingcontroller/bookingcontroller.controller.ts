import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BookingServiceService } from '../../booking-service/booking-service.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '../../dtos/CreateBookingDto';
import { AuthGuardWithRoles } from 'src/guards/AuthGuard';
import { Roles } from 'src/decorators/Roles.decorator';
import { Role } from 'src/types/enum.class';
import { AssignEmployeeDto } from '../../dtos/AssignEmployeeDto';
import { MakeBookingPayment } from '../../dtos/MakePayment.dto';
import { UpdateBookingDto } from '../../dtos/UpdateBookingDto';

@ApiTags("Booking")
@Controller('booking')
@ApiBearerAuth()
export class BookingcontrollerController {
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
    @Get(':userId')
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
        try {
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
            return await this.bookingServiceService.assignEmployee(bookingId, data)
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }


    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.Employee && Role.Manager)
    @Put('update-booking-status/:id')
    async updateBooking(@Param('id') id: string, @Body() data: UpdateBookingDto) {
        try {
            return await this.bookingServiceService.updateBooking(id, data)
        }
        catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
        }
    }

    @UseGuards(AuthGuardWithRoles)
    @Roles(Role.User)
    @Put('/make-payment/:id')
    async makePayment(@Param('id') id: string, data: MakeBookingPayment) {
        try {
            return await this.bookingServiceService.makePayment(id, data)

        }
        catch (e) {
            throw new BadRequestException(e.message)
        }
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
