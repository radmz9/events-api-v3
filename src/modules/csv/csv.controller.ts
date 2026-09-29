import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CsvService } from './csv.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRoles } from 'src/common/enums';
import 'multer';


export enum StaffTypes {
    TEACHER = 4,
    ADMINS = 5
}

@Controller('csv')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ROOT)
export class CsvController {
    constructor(private readonly csvService: CsvService){}

    @Post('/students')
    @UseInterceptors(FileInterceptor('file'))
    async uploadStudentsCsv(@UploadedFile() file: Express.Multer.File){
        if(!file) throw new BadRequestException({ csvFile: 'El archivo CSV es requerido' })

        if(file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) throw new BadRequestException({ csvFile: 'El archivo debe ser un formato CSV valido' })
        
        return await this.csvService.registerStudents(file.buffer);
    }

    @Post('/teachers')
    @UseInterceptors(FileInterceptor('file'))
    async uploadTeachersCsv(@UploadedFile() file: Express.Multer.File){
        if(!file) throw new BadRequestException({ csvFile: 'El archivo CSV es requerido' })

        if(file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) throw new BadRequestException({ csvFile: 'El archivo debe ser un formato CSV valido' })
        
        return await this.csvService.registerStaff(file.buffer, StaffTypes.TEACHER);
    }

    @Post('/staff')
    @UseInterceptors(FileInterceptor('file'))
    async uploadStaffCsv(@UploadedFile() file: Express.Multer.File){
        if(!file) throw new BadRequestException({ csvFile: 'El archivo CSV es requerido' })

        if(file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) throw new BadRequestException({ csvFile: 'El archivo debe ser un formato CSV valido' })
        
        return await this.csvService.registerStaff(file.buffer, StaffTypes.ADMINS);
    }

    @Post('/records')
    @UseInterceptors(FileInterceptor('file'))
    async uploadRecords(@UploadedFile() file: Express.Multer.File){
        if(!file) throw new BadRequestException({ csvFile: 'El archivo CSV es requerido' })

        if(file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) throw new BadRequestException({ csvFile: 'El archivo debe ser un formato CSV valido' })

        return this.csvService.attendaceEvent(file.buffer)
    }

    @Post('/students/update/status')
    @UseInterceptors(FileInterceptor('file'))
    async uploadStudentsStatusFile(
        @UploadedFile() file: Express.Multer.File
    ){
        if(!file) throw new BadRequestException({ csvFile: 'El archivo CSV es requerido' })

        if(file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) throw new BadRequestException({ csvFile: 'El archivo debe ser un formato CSV valido' })

        return this.csvService.changeStudentStatus(file.buffer)
    }

}
