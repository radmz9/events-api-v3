import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';
import { TypeArea } from '../enums/type-areas.enum';
import { CalendarEntity } from 'src/modules/calendars/entity/calendar.entity';
import { SedeEntity } from 'src/modules/sedes/entity/sede.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleMysqlError } from 'src/common/utils/db-error-handler';
import { plainToInstance } from 'class-transformer';
import { studentQueryOptions } from './students.constants';
import { StatReportResDto, StudentStatsDto } from '../dto/responses/student-stats.dto';
import { RawStats } from '../interfaces/raw-stats.interface';
import { UserEventsSummaryDto } from '../dto/responses/user-events-summary.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
        private readonly usersService: UsersService
    ){}

    async createStudent(dto: CreateStudentDto, role: string, idArea: number): Promise<UserResponseDto>{
        await this.usersService.validateUniqueCode(dto.codigo);
        if(role === 'ROOT'){
            await this.usersService.validateTypeArea(dto.idArea, TypeArea.CARRERA);
        }

        await this.usersService.validateManyExists([
            { entity: CalendarEntity, conditions: { id: dto.idCalendario }, name: 'Calendar' },
            { entity: SedeEntity, conditions: { id: dto.idSede }, name: 'Sede' }
        ]);

        const roles = [1,2,3];
        if(!roles.includes(dto.idRol)){
            throw new BadRequestException({ idRol: MESSAGES.INVALID_VALUE })
        }

        const payload = role === 'ROOT' ? dto : { ...dto, idArea };
        const student = this.userRepo.create(payload);

        try {
            const studentCreated = await this.userRepo.save(student);
            const data = await this.userRepo.findOneOrFail({
                where: { id: studentCreated.id },
                ...studentQueryOptions
            });

            const result = UserResponseDto.fromEntity(data);

            return plainToInstance(UserResponseDto, result, {
                excludeExtraneousValues: true
            })
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async updateStudent(studentId: number, dto: CreateStudentDto): Promise<UserResponseDto>{
        const student = await this.usersService.validateExists({ id: studentId }, 'Student');
        if(student.codigo !== dto.codigo){
            await this.usersService.validateUniqueCode(dto.codigo)
        }
        if(dto.idArea) await this.usersService.validateTypeArea(dto.idArea, TypeArea.CARRERA);

        await this.usersService.validateManyExists([
            { entity: CalendarEntity, conditions: { id: dto.idCalendario }, name: 'Calendar' },
            { entity: SedeEntity, conditions: { id: dto.idSede }, name: 'Sede' }
        ]);
        const roles = [1,2,3];
        if(!roles.includes(dto.idRol)){
            throw new BadRequestException({ idRol: MESSAGES.INVALID_VALUE })
        }
        
        try {
            Object.assign(student, dto);
            await this.userRepo.save(student);
            const data = await this.userRepo.findOneOrFail({
                where: { id: student.id },
                ...studentQueryOptions
            });

            const result = UserResponseDto.fromEntity(data);
            return plainToInstance(UserResponseDto, result, {
                excludeExtraneousValues: true
            });
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async deleteStudent(studentId: number, role: string, areaId: number): Promise<void>{
        const student = await this.usersService.validateExists({ id: studentId }, 'Student');
        
        if(![1,2,3].includes(student.idRol)) throw new BadRequestException({ studentId: MESSAGES.USER_NOT_FOUND })

        if(role !== 'ROOT' && areaId !== student.idArea){
            throw new BadRequestException({ studentId: MESSAGES.FORBIDDEN_EXCEPTION });
        }else{
            return this.usersService.removeRecord(studentId);
        }
    }

    async fetchOneStudent(code: string, role: string, areaId: number): Promise<UserResponseDto> {
        const student = await this.usersService.validateExists({ codigo: code }, 'User');

        if(!student) throw new BadRequestException({ code: MESSAGES.USER_NOT_FOUND });
        
        if(role !== 'ROOT' && areaId !== student.idArea && [1,2,3].includes(student.idRol)){
            throw new BadRequestException({ code: MESSAGES.FORBIDDEN_EXCEPTION });
        }

        const user = await this.userRepo.findOneOrFail({
            where: { id: student.id },
            ...studentQueryOptions
        });

        const plainData = UserResponseDto.fromEntity(user);

        return plainToInstance(UserResponseDto, plainData, {
            excludeExtraneousValues: true
        });
    }

    async fetchAllByArea(areaId: number, calendarId: number): Promise<UserResponseDto[]>{
        await this.usersService.validateTypeArea(areaId, TypeArea.CARRERA);

        const data = await this.userRepo.find({
            where: { idArea: areaId, idCalendario: calendarId },
            ...studentQueryOptions,
            order: { nombre: 'ASC' }
        });

        const plainData = data.map((s) => UserResponseDto.fromEntity(s));

        return plainToInstance(UserResponseDto, plainData, { 
            excludeExtraneousValues: true
        })
    }

    //Students Historical Report
    async historicalStudentReport(areaId: number): Promise<StatReportResDto>{
        const rawData = await this.userRepo
            .createQueryBuilder('u')
            .innerJoin('u.calendario', 'c')
            .select([
                "c.nombre AS calendario",
                "COUNT(*) AS total",
                "SUM(u.genero = 'H') AS hombres",
                "SUM(u.genero = 'M') AS mujeres",
                "SUM(u.etnia) AS indigenas",
                "SUM(u.idRol = 1) AS alumnos",
                "SUM(u.idRol = 2) AS egresados",
                "SUM(u.idRol = 3) AS inactivos"
            ])
            .where('u.idArea = :idArea', { idArea: areaId })
            .groupBy('u.idCalendario')
            .orderBy('c.nombre', 'DESC')
            .getRawMany<RawStats>()

        const formatedData = rawData.map((r: RawStats) => StudentStatsDto.fromDto(r));
        
        const stats = formatedData.reduce((acc, row) => {
            return{
                total: acc.total + row.total,
                hombres: acc.hombres + row.hombres,
                mujeres: acc.mujeres + row.mujeres,
                indigenas: acc.indigenas + row.indigenas,
                alumnos: acc.alumnos + row.alumnos,
                egresados: acc.egresados + row.egresados,
                inactivos: acc.inactivos + row.inactivos,
            }
        }, { total: 0, hombres: 0, mujeres: 0, indigenas: 0, alumnos: 0, egresados: 0, inactivos: 0 });
        
        return {
            stats,
            caledarDetails: rawData
        }
    }

    //Events Summary
    async eventsSummaryByStudent(code: string, role: string, areaId: number): Promise<UserEventsSummaryDto>{
        const user = await this.usersService.validateExists({ codigo: code }, 'User');

        if(!user) throw new BadRequestException({ code: MESSAGES.USER_NOT_FOUND });

        if(role !== 'ROOT' && areaId !== user.idArea && [1,2,3].includes(user.idRol)){
            throw new BadRequestException({ code: MESSAGES.FORBIDDEN_EXCEPTION });
        }

        return this.usersService.getUserEvents(user.id);    
    }

}
