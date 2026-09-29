import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordEntity } from './entity/record.entity';
import { Repository } from 'typeorm';
import { EventEntity } from '../events/entity/event.entity';
import { UserEntity } from '../users/entity/users.entity';
import { handleMysqlError } from 'src/common/utils/db-error-handler';
import { plainToInstance } from 'class-transformer';
import { RecordResDto } from './dto/responses/record-res.dto';
import { AdminRoles } from '../users/enums/admin-roles.enum';
import { CreateRecordDto } from './dto/create-record-dto';
import { OutsiderEntity } from '../outsiders/entity/outsider.entity';
import { OutsiderDto } from '../outsiders/dto/outsider.dto';
import { OutsiderResDto } from '../outsiders/dto/responses/outsider-res.dto';
import { EventDataResDto } from './dto/responses/event-data-res.dto';
import { InternalsDataResDto } from './dto/responses/internals-data-res.dto';
import { CompleteEventReportResDto } from './dto/responses/complete-event-report.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';

interface UserInteface {
    idUsuario: number,
    idRol: AdminRoles,
    idArea: number
}

@Injectable()
export class RecordsService {
    constructor(
        @InjectRepository(RecordEntity) private recordsRepo: Repository<RecordEntity>,
        @InjectRepository(EventEntity) private readonly eventRepo: Repository<EventEntity>,
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(OutsiderEntity) private readonly outsiderRepo: Repository<OutsiderEntity>
    ){}

    async validateEventIsActive(eventId: number): Promise<void> {
        const res = await this.eventRepo.findOne({ where: { id: eventId }, select: ['isActive'] })
        if(!res?.isActive){
            throw new BadRequestException({ event: `El evento está inactivo` });
        }
    }

    async validateUserRole(userCode: string): Promise<UserInteface>{
        const user = await this.userRepo.findOne({ where: { codigo: userCode }, select: ['id', 'idRol', 'idArea'] });
        if(!user){
            throw new BadRequestException({ userCode: MESSAGES.USER_NOT_FOUND });
        }
        if([3,6].includes(user.idRol)){
            throw new BadRequestException({ userCode: MESSAGES.USER_INACTIVE })
        }
        return { idUsuario: user.id, idRol: user.idRol, idArea: user.idArea };
    }

    async checkIn(dto: CreateRecordDto, eventId: number): Promise<RecordResDto>{
        const { userCode } = dto;
        await this.validateEventIsActive(eventId);
        const userData = await this.validateUserRole(userCode);
        Object.assign(userData, { idEvento: eventId });
        const newRecord = this.recordsRepo.create(userData);
        try {
            const recordSaved = await this.recordsRepo.save(newRecord)
            const data = await this.recordsRepo.findOne({
                where: { id: recordSaved.id },
                select: {
                    id: true,
                    usuario: {
                        codigo: true,
                        nombre: true,
                        idRol: true
                    },
                    createdAt: true
                },
                relations: {
                    usuario: true,
                }
            });

            if(!data) throw new BadRequestException({ event: 'Evento no econtrado' })

            const plainData = RecordResDto.fromEntity(data);

            return plainToInstance(RecordResDto, plainData, {
                excludeExtraneousValues: true
            })
        } catch (error) {
            handleMysqlError(error);
        }
    }

    async deleteCommunityRecord(recordId: number): Promise<void>{
        try {
            const result = await this.recordsRepo.delete(recordId)
            if(!result.affected){
                throw new NotFoundException()
            }
        } catch (error) {
            handleMysqlError(error);
        }
    }

    // Outsiders
    async checkInOutsider(dto: OutsiderDto, eventId: number): Promise<OutsiderResDto>{
        await this.validateEventIsActive(eventId);
        const newOutsider = this.outsiderRepo.create(dto);
        Object.assign(newOutsider, { idEvento: eventId })
        try {
            const res = await this.outsiderRepo.save(newOutsider);
            return plainToInstance(OutsiderResDto, res, {
                excludeExtraneousValues: true
            })
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async deleteOutsiderRecord(outsiderId: number): Promise<void>{
        try {
            const result = await this.outsiderRepo.delete(outsiderId);
            if(!result.affected){
                throw new NotFoundException();
            }
        } catch (error) {
            handleMysqlError(error)
        }
    }
    //Event Report Stats
    async getInternalStats(eventId: number): Promise<Array<{ label: string; value: number }>> {
        const stats = await this.recordsRepo
            .createQueryBuilder('asistencia')
            .innerJoin('asistencia.rol', 'rol')
            .select('rol.nombre', 'label')
            .addSelect('COUNT(asistencia.id)', 'value')
            .where('asistencia.idEvento = :idEvento', { idEvento: eventId })
            .groupBy('rol.nombre')
            .printSql()
            .getRawMany<{ label: string; value: string }>()

        return stats.map((stat) => ({
            label: stat.label,
            value: parseInt(stat.value, 10)
        }))
    }

    private async getDetailedInternals(eventId: number): Promise<Record<string, InternalsDataResDto[]>>{
        const records = await this.recordsRepo.find({
            where: { idEvento: eventId },
            select: {
                usuario: {
                    codigo: true,
                    nombre: true,
                    calendario: {
                        nombre: true
                    }
                },
                rol: {
                    id: true,
                    nombre: true
                },
                area: {
                    clave: true,
                    nombre: true
                },
                createdAt: true,
            },
            order: { idRol: 'ASC' }, 
            relations: {
                usuario: {
                    calendario: true
                },
                area: true,
                rol: true
            }
        });


        const mapedRecords: InternalsDataResDto[] = [];

        for(let i = 0, len = records.length; i < len; i++){
            mapedRecords.push({
                codigo: records[i].usuario.codigo,
                nombre: records[i].usuario.nombre,
                calendario: records[i].usuario.calendario?.nombre || 'Sin calendario',
                rol: records[i].rol.nombre || 'Sin Rol',
                area: records[i].area.nombre,
                createdAt: records[i].createdAt
            })
        }
    
        return mapedRecords.reduce((groups: Record<string, typeof mapedRecords>, record) => {
            const roleName = record.rol;
            if(!groups[roleName]){
                groups[roleName] = []
            }
            groups[roleName].push(record);
            return groups;
        }, {})

    }

    private async getDetailedExternals(eventId: number): Promise<OutsiderEntity[]>{
        return this.outsiderRepo.find({
            where: { idEvento: eventId },
            select: {
                id: true,
                nombre: true,
                dependencia: true,
                genero: true,
                createdAt: true
            },
            order: { createdAt: 'DESC' }
        })
    }

    private async getEventBasicInfo(eventId: number): Promise<EventDataResDto>{
        const data = await this.eventRepo.findOneOrFail({
            where: { id: eventId },
            select: {
                id: true,
                nombre: true,
                responsable: true,
                otroLugar: true,
                lugar: {
                    nombre: true
                },
                tipo: {
                    nombre: true,
                },
                fecha: true,
                hora: true,
                area: {
                    clave: true,
                    nombre: true,
                    account: {
                        id: true,
                        user: {
                            nombre: true
                        },
                        rolAdmin: {
                            nombre_cargo: true
                        }
                    }
                }
            },
            relations: {
                lugar: true,
                tipo: true,
                area: {
                    account: {
                        user: true,
                        rolAdmin: true
                    }
                }
            }
        });
        return {
            id: data.id,
            nombre: data.nombre,
            responsable: data.responsable,
            lugar: data?.lugar?.nombre ?? data.otroLugar ?? 'No especificado',
            tipo: data.tipo?.nombre || 'Tipo no especificado',
            fecha: data.fecha,
            hora: data.hora,
            area: data.area.nombre,
            createdBy: data.area?.account?.user?.nombre || 'SIN DATO, POR EL MOMENTO',
            rolAdminUser: data.area?.account?.rolAdmin?.nombre_cargo || 'SIN DATO'
        }
    }

    async getCompleteEventReport(eventId: number): Promise<CompleteEventReportResDto>{
        const [event, statsInternas, internos, externos] = await Promise.all([
            this.getEventBasicInfo(eventId),
            this.getInternalStats(eventId),
            this.getDetailedInternals(eventId),
            this.getDetailedExternals(eventId)
        ])
        if(!event) throw new NotFoundException({ eventId: 'Event not found!' })
        return {
            event: event,
            stats: {
                byRole: [
                    ...statsInternas,
                    { label: 'Externos', value: externos.length }
                ],
                total: statsInternas.reduce((acc, curr) => acc + curr.value, 0) + externos.length
            },
            data: {
                internals: internos,
                externals: externos
            }
        }
    }

    async getInternals(eventId: number){
        return this.recordsRepo
            .createQueryBuilder('r')
            .innerJoin('r.usuario', 'u')
            .select([
                'r.id AS id',
                'u.codigo AS codigo',
                'u.nombre AS nombre',
                'r.idRol AS idRol',
                'r.createdAt AS createdAt'
            ])
            .where('r.idEvento = :idEvento', { idEvento: eventId })
            .orderBy('r.createdAt', 'DESC')
            .getRawMany<{ id: number, codigo: string, nombre: string, idRol: number, createdAt: string }>();
    }

    async getRawStats(eventId: number){
        const rawStats = await this.recordsRepo.createQueryBuilder('r')
            .select([
                "SUM(idRol = 1) AS alumnos",
                "SUM(idRol = 2) AS egresados",
                "SUM(idRol = 4) AS profesores",
                "SUM(idRol = 5) AS administrativos",
                "0 AS externos",
                "COUNT(*) AS total",
            ])
            .where('r.idEvento = :idEvento', { idEvento: eventId })
            .getRawOne<{ alumnos: number, egresados: number, profesores: number, administrativos: number, externos: number, total: 0 }>()
        return {
            alumnos: Number(rawStats?.alumnos),
            egresados: Number(rawStats?.egresados),
            profesores: Number(rawStats?.profesores),
            administrativos: Number(rawStats?.administrativos),
            externos: Number(rawStats?.externos),
            total: Number(rawStats?.total),
        }
    }

    async getAttendaceData(eventId: number){
        const event = await this.eventRepo.findOne({ where: { id: eventId }, select: { id: true } });
        if(!event) throw new BadRequestException({ eventId: 'Evento no econtrado' });
        const [stats, internals, externals] = await Promise.all([
            this.getRawStats(eventId),
            this.getInternals(eventId),
            this.getDetailedExternals(eventId)
        ]);
        stats.externos = externals.length;
        stats.total+= externals.length;
        return {
            stats,
            internals, 
            externals
        }
    }
}
