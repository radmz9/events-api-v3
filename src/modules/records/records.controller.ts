import { Body, Controller, Delete, Get, Param, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record-dto';
import { IntParamPipe } from 'src/common/pipes';
import { OutsiderDto } from '../outsiders/dto/outsider.dto';
import { ReportsService } from '../reports/reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Public } from 'src/common/decorators';
import { EventTokenGuard } from 'src/common/guards/event.token.guard';
import { CurrentEvent } from 'src/common/decorators/current-event.decorator';

@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordsController {
    constructor(
        private recordService: RecordsService,
        private reportService: ReportsService
    ) {}

    //Community Records
    @Post('/community')
    @Public()
    @UseGuards(EventTokenGuard)
    async checkIn(
        @Body() dto: CreateRecordDto,
        @CurrentEvent() eventId: number
    ){
        return this.recordService.checkIn(dto, eventId)
    }

    @Delete('/community/:recordId')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Public()
    async deleteCommunityRecord(
        @Param('recordId', IntParamPipe) recordId: number
    ){
        return this.recordService.deleteCommunityRecord(recordId);
    }

    //Outsiders Records
    @Post('/outsiders')
    @Public()
    @UseGuards(EventTokenGuard)
    async checkInOutsider(
        @Body() dto: OutsiderDto,
        @CurrentEvent() eventId: number
    ){
        return this.recordService.checkInOutsider(dto, eventId);
    }

    @Delete('/outsiders/:outsiderId')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Public()
    async deleteOutsiderRecord(
        @Param('outsiderId', IntParamPipe) outsiderId: number
    ){
        return this.recordService.deleteOutsiderRecord(outsiderId);
    }

    //Get Attendance
    @Get('/event/attendance')
    @Public()
    @UseGuards(EventTokenGuard)
    async getEventDetailedData(
        @CurrentEvent('event') eventId: number
    ){
        return this.recordService.getAttendaceData(eventId)
    }

    @Get('/event/attendance/:eventId')
    async getEventAttendace(
        @Param('eventId', IntParamPipe) eventId: number
    ){
        return this.recordService.getAttendaceData(eventId)
    }

    //Generate PDF Report
    @Get('/event/pdf/:eventId')
    @Public()
    async createPDFReportEvent(
        @Param('eventId', IntParamPipe) eventId: number
    ): Promise<StreamableFile>{
        try {
            const report = await this.recordService.getCompleteEventReport(eventId);
            const pdf = await this.reportService.generateEventAttendancePDF(report);
            
            const fixedPart = `${report.event.tipo}-${report.event.fecha}.pdf`;
            const eventName = report.event.nombre;
            const availableNameLength = 100 - fixedPart.length - 1;
            const truncateName = eventName.slice(0, Math.max(0, availableNameLength));

            const fileName = `${report.event.tipo}-${truncateName}-${report.event.fecha}.pdf`

            return new StreamableFile(pdf, {
                type: 'application/pdf',
                disposition: `inline; filename="${fileName}"`
            })
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }
}
