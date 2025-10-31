import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../entities/Booking.entity';
import { CreateBookingDto } from '../dtos/CreateBookingDto';
import { AssignEmployeeDto } from '../dtos/AssignEmployeeDto';
import { UpdateBookingStatus } from '../dtos/UpdateBookingStatus.dto';
import { MakeBookingPayment } from '../dtos/MakePayment.dto';
import { UpdateBookingDto } from '../dtos/UpdateBookingDto';

@Injectable()
export class BookingServiceService {
    constructor(@InjectModel('Booking') private readonly bookingModel: Model<Booking>) { }

    async createBooking(data: CreateBookingDto): Promise<Booking> {
        const newBooking = await this.bookingModel.create(data)
        return newBooking
    }

    async getAllBooking(): Promise<Booking[]> {
        const allBooking = await this.bookingModel.find()
        return allBooking
    }


    async getBookingById(id: string): Promise<Booking | null> {
        const getByID = await this.bookingModel.findById(id)
        return getByID
    }


    async getBookingByUserId(id: string): Promise<Booking[] | { message: string }> {
        const bookings = await this.bookingModel.find({ id })
        if (!bookings) {
            throw new NotFoundException("No bookings Found")
        }
        return bookings
    }

    async updateBooking(id: string, data: UpdateBookingDto): Promise<Booking | null> {
        const update = await this.bookingModel.findByIdAndUpdate(id, data, { new: true })
        return update

    }


    async assignEmployee(id: string, data: AssignEmployeeDto): Promise<Booking | null> {
        return await this.bookingModel.findByIdAndUpdate(id, data)
    }

    async updateBookingStatus(id: string, data: UpdateBookingStatus): Promise<Booking | null> {
        const update = await this.bookingModel.findByIdAndUpdate(id, data)
        return update
    }

    async makePayment(id: string, data: MakeBookingPayment): Promise<{ message: string }> {
        const booking = await this.getBookingById(id)
        if (booking?.status === "Completed") {
            const update = await this.bookingModel.findByIdAndUpdate(id, data)
            if (!update) {
                throw new NotFoundException("No Booking Found against this ID")
            }
            else {
                return { message: "Payment Successful" }
            }
        }
        return { message: "Booking is still in progress" }



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
