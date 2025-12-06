import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { BookingServiceService } from 'src/features/Booking/booking-service/booking-service.service';


@Injectable()
export class AdminReportService {
  constructor(private readonly bookingService: BookingServiceService) {}

  async generateReportPDF(startDate: string, endDate: string): Promise<Buffer> {
    // Fetch bookings in date range
    const bookings = await this.bookingService['bookingModel'].find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).lean();

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(20).text('Car Wash Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`From: ${startDate} To: ${endDate}`);
    doc.moveDown();
    doc.fontSize(14).text(`Total Bookings: ${bookings.length}`);
    doc.moveDown();

    bookings.forEach((booking, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. Date: ${booking.date?.toISOString().slice(0,10)} | Status: ${booking.status} | Time Slot: ${booking.timeSlot}`
      );
    });

    doc.end();
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }
}
