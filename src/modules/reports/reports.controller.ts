import { Controller } from '@nestjs/common';
// import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor( private reportService: ReportsService ) {}
    // @Get('/preview')
    // async preview(@Res() res: Response){
    //     const buffer = await this.reportService.generateEventAttendancePDF();

    //     res.set({
    //         'Content-Type': 'application/pdf',
    //         'Content-Disposition': 'inline; filename=preview.pdf',
    //         'Content-Length': buffer.length,
    //     })

    //     res.end(buffer);
    // }
}
