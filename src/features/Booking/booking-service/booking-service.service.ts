import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from '../entities/Booking.entity';
import { CreateBookingDto } from '../dtos/CreateBookingDto';
import { MakeBookingPayment } from '../dtos/MakePayment.dto';
import { UpdateBookingDto } from '../dtos/UpdateBookingDto';
import { UserAuthService } from 'src/user/userAuth/services/userAuth.service';
import { CreateReviewDto } from '../dtos/ReviewbookingDto';
import { Employee } from 'src/user/employee/entities/Employeet.entity';
import { CreateFlagDto } from 'src/user/employee/dto/createFlagDto';
import { ResolveFlagDto } from '../dtos/ResolveFlagDto';

@Injectable()
export class BookingServiceService {
    constructor(@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
        @InjectModel('Employee') private readonly employeeModel: Model<Employee>,
        private readonly userAuthService: UserAuthService

    ) { }

    async createBooking(data: CreateBookingDto): Promise<Booking> {
        const newBooking = await this.bookingModel.create(data)
        return newBooking
    }

    async getAllBooking(): Promise<Booking[]> {
        const allBooking = await this.bookingModel.find()
        return allBooking
    }


    async getBookingById(id: string): Promise<Booking> {
        const getByID = await this.bookingModel.findOne({ _id: id });
        if (!getByID) {
            throw new NotFoundException("booking not found")
        }

        return getByID
    }


    async getBookingByUserId(id: string): Promise<Booking[] | { message: string }> {
        const bookings = await this.bookingModel.find({ id })
        if (!bookings) {
            throw new NotFoundException("No bookings Found")
        }
        return bookings
    }

    async ManagerUpdateBookingStatus(id: string, data: UpdateBookingDto): Promise<Booking | null> {
        const update = await this.bookingModel.findByIdAndUpdate(id, data, { new: true })
        return update
    }

    async EmployeeupdateBookingStatus(id: string, data: UpdateBookingDto): Promise<Booking | null> {
        const update = await this.bookingModel.findByIdAndUpdate(id, data, { new: true })
        return update
    }



    async assignEmployee(bookingId: string, employeeId: string): Promise<Booking | null> {
        const employee = await this.employeeModel.findById(employeeId);
        console.log("employeeId: " + employeeId, "bookingId: " + bookingId)
        if (!employee) {
            throw new NotFoundException("Employee not found");
        }

        const booking = await this.bookingModel.findById(bookingId);
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        booking.assignedEmployeeId = new Types.ObjectId(employeeId);
        booking.status = "Assigned";
        await booking.save();

        await this.employeeModel.findByIdAndUpdate(
            employeeId,
            { $addToSet: { assignedBookings: booking._id } },
            { new: true }
        );

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

        if (booking.status !== 'Completed') {
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

        if (booking.status !== 'Completed')
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
