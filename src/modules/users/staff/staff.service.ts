import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/users.entity';
import { Repository } from 'typeorm';
import { StaffResponseDto } from '../dto/responses/staff-response.dto';
import { staffQueryOptions } from './staff.constants';
import { plainToInstance } from 'class-transformer';
import { BaseUserDto } from '../dto/base-user.dto';
import { AdminRoles } from '../enums/admin-roles.enum';
import { TypeArea } from '../enums/type-areas.enum';
import { handleMysqlError } from 'src/common/utils/db-error-handler';
import { UserEventsSummaryDto } from '../dto/responses/user-events-summary.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private readonly userService: UsersService,
    ){}

    private roles: Array<number> = [4,5];

    private async validateRoleAndArea(role: AdminRoles, areaId: number): Promise<void>{
        if(!this.roles.includes(role)){
            throw new BadRequestException({ idRol: MESSAGES.INVALID_VALUE })
        }    

        if(role === AdminRoles.PROFESOR){
            await this.userService.validateTypeArea(areaId, TypeArea.DEPARTAMENTO)
        }else{
            await this.userService.validateTypeArea(areaId, TypeArea.AREA)
        }
    }

    async fetchUsersByType(typeId: number): Promise<StaffResponseDto[]>{
        if(!this.roles.includes(typeId)){
            throw new BadRequestException({ typeId: `No se encontraron usuarios` })
        }

        const users = await this.userRepo.find({
            where: { idRol: typeId },
            ...staffQueryOptions,
            order: { nombre: 'ASC' }
        });

        const plainData = users.map((u) => StaffResponseDto.fromEntity(u));

        return plainToInstance(StaffResponseDto, plainData, {
            excludeExtraneousValues: true
        });
    }

    async fetchOne(code: string, role: string): Promise<StaffResponseDto>{
        const user = await this.userService.validateExists({ codigo: code }, 'User');

        if(role !== 'ROOT' && [5].includes(user.idRol)){
            throw new BadRequestException({ code: MESSAGES.FORBIDDEN_EXCEPTION });
        }

        const data = await this.userRepo.findOneOrFail({
            where: { codigo: code },
            ...staffQueryOptions
        });

        const plainData = StaffResponseDto.fromEntity(data);

        return plainToInstance(StaffResponseDto, plainData, {
            excludeExtraneousValues: true
        })
    }

    async fetchUserSummaryEvents(code: string, role: string): Promise<UserEventsSummaryDto>{
        const user = await this.userService.validateExists({ codigo: code }, 'User');

        if(!user) throw new BadRequestException({ code: MESSAGES.USER_NOT_FOUND });

        if(role !== 'ROOT' && [5].includes(user.idRol)){
            throw new BadRequestException({ code: MESSAGES.FORBIDDEN_EXCEPTION });
        }

        return this.userService.getUserEvents(user.id);
    }

    //
    async createUser(dto: BaseUserDto): Promise<StaffResponseDto>{
        await this.validateRoleAndArea(dto.idRol, dto.idArea)

        await this.userService.validateUniqueCode(dto.codigo);

        const user = this.userRepo.create(dto);
        try {
            const userCreated = await this.userRepo.save(user);
            const data = await this.userRepo.findOneOrFail({
                where: { id: userCreated.id },
                ...staffQueryOptions
            });

            const plainData = StaffResponseDto.fromEntity(data);

            return plainToInstance(StaffResponseDto, plainData, {
                excludeExtraneousValues: true
            });
        } catch (error) {
            handleMysqlError(error)
        }
    }

    async updateUser(userId: number, dto: BaseUserDto): Promise<StaffResponseDto>{
        const user = await this.userService.validateExists({ id: userId }, 'User');
        
        await this.validateRoleAndArea(dto.idRol, dto.idArea);
        
        if(user.codigo !== dto.codigo){
            await this.userService.validateUniqueCode(dto.codigo);
        }

        try {
            Object.assign(user, dto);
            await this.userRepo.save(user);
            const data = await this.userRepo.findOneOrFail({
                where: { id: user.id },
                ...staffQueryOptions
            });

            const plainData = StaffResponseDto.fromEntity(data);

            return plainToInstance(StaffResponseDto, plainData, {
                excludeExtraneousValues: true
            });

        } catch (error) {
            handleMysqlError(error)
        }
    }

    async deleteUser(userId: number): Promise<void>{
        const user = await this.userService.validateExists({ id: userId }, 'User');
        if(!this.roles.includes(user.idRol)){
            throw new BadRequestException({ userId: MESSAGES.FORBIDDEN_EXCEPTION });
        }

        return this.userService.removeRecord(userId);
    }
}
