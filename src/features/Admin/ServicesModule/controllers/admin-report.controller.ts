import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminReportService } from '../services/admin-report.service';

@Controller('admin/reports')
export class AdminReportController {
  constructor(private readonly reportService: AdminReportService) {}

  @Get('export')
  async exportReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportService.generateReportPDF(
      startDate,
      endDate,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    });
    res.send(pdfBuffer);
  }
}
