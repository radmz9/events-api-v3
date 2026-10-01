import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/users.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { AreaEntity } from '../areas/entity/areas.entity';
import { TypeArea } from './enums/type-areas.enum';
import { RecordEntity } from '../records/entity/record.entity';
import { UserEventsSummaryDto } from './dto/responses/user-events-summary.dto';
import { UserWithEventsDto } from './dto/responses/user-events.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class UsersService extends BaseService<UserEntity> {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(AreaEntity) private areaRepo: Repository<AreaEntity>,
        @InjectRepository(RecordEntity) private recordsRepo: Repository<RecordEntity>,
        dataSource: DataSource
    ){
        super(userRepo, dataSource)
    }

    async validateUniqueCode(code: string): Promise<void>{
        const count = await this.userRepo.count({ where: { codigo: code } });
        if(count){
            throw new BadRequestException({ codigo: `${code} ${MESSAGES.ALREADY_EXISTS}` });
        }
    }   

    async validateTypeArea(idArea: number, type: TypeArea): Promise<void>{
        const count = await this.areaRepo.count({ where: { id: idArea, id_tipo_area: type } });
        if(!count){
            throw new BadRequestException({ idArea: `Esta área no es valida para este tipo de usuario` });
        }
    }  

    // Get user events
    async getUserEvents(userId: number): Promise<UserEventsSummaryDto>{
        const [records, total] = await this.recordsRepo.findAndCount({
            where: { idUsuario: userId },
            select: {
                evento: {
                    id: true,
                    nombre: true,
                    duracion: true,
                    tipo: {
                        id: true,
                        nombre: true
                    },
                    lugar: {
                        id: true,
                        nombre: true
                    },
                    otroLugar: true,
                    fecha: true,
                    area: {
                        nombre: true
                    }
                },
                createdAt: true      
            },
            order: { createdAt: 'DESC' },
            relations: {
                evento: {
                    lugar: true,
                    tipo: true,
                    area: true
                }
            }
        });

        let hours = 0;
        for(let i = 0, len = records.length; i < len; i++){
            hours+= records[i].evento.duracion;
        }
        return { 
            total, 
            totalHours: hours, 
            events: records.map(r => ({
                id: r.evento.id,
                nombre: r.evento.nombre,
                duracion: r.evento.duracion,
                tipo: r.evento.tipo.nombre,
                lugar: r.evento.lugar?.nombre ?? r.evento.otroLugar ?? 'No especificado',
                fecha: r.evento.fecha,
                area: r.evento.area.nombre
            }))
        }
    }

    //Get user by code
    async getAttendanceByUser(code: string): Promise<UserWithEventsDto>{
        const user = await this.validateExists({ codigo: code }, 'User');
        const userInfo = await this.userRepo.findOneOrFail({
            where: { id: user.id },
            select: {
                id: true,
                codigo: true,
                nombre: true,
                area: {
                    id: true,
                    nombre: true,
                    clave: true,
                    account: {
                        user_codigo: true,
                        user: {
                            nombre: true
                        },
                        rolAdmin: {
                            nombre_cargo: true
                        }
                    }
                },
                idRol: true,
                rol: {
                    nombre: true
                },
                createdAt: true
            },
            relations: {
                area: {
                    account: {
                        user: true,
                        rolAdmin: true
                    }
                },
                rol: true
            }
        });

        if([6].includes(userInfo.idRol)) throw new BadRequestException({ code: MESSAGES.USER_NOT_FOUND });
        
        const eventsSummary = await this.getUserEvents(user.id);
        const formatedData = {
            id: userInfo.id,
            codigo: userInfo.codigo,
            nombre: userInfo.nombre,
            area: userInfo.area.nombre,
            rol: userInfo.rol.nombre,
            areaResponsable: userInfo?.area?.account?.user?.nombre || 'SIN DATO',
            rolAreaResponsable: userInfo?.area?.account?.rolAdmin?.nombre_cargo || 'SIN DATO',
            eventsSummary
        }
        return formatedData;
    }

    async findUserBycode(code: string, role: string, areaId: number): Promise<{ allowed: boolean; type_user: string; }>{
        const user = await this.validateExists({ codigo: code }, 'User');

        if(role === 'COORDI' && user.idArea !== areaId){
            throw new BadRequestException({ allowed: false, reason: MESSAGES.FORBIDDEN_EXCEPTION })
        }

        if(role === "JEFE_DPTO" && ![4].includes(user.idRol)){
            throw new BadRequestException({ allowed: false, reason: MESSAGES.FORBIDDEN_EXCEPTION })
        }

        const userRole: number = user.idRol;
        let type_user = "";
        if(userRole <= 3){
            type_user = 'alumnos'
        }else if(userRole > 3 && userRole <= 5){
            type_user = 'personal'
        }

        if([6].includes(user.idRol)) throw new BadRequestException({ allowed: false, reason: MESSAGES.FORBIDDEN_EXCEPTION })

        return {
            allowed: true,
            type_user
        };
    }
}
