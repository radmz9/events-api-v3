import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthAccountEntity } from './entity/auth_account.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entity/users.entity';
import { AreaEntity } from '../areas/entity/areas.entity';
import { AuthAccountDto } from './dto/auth_account.dto';
import { AuthAccountResponseDto } from './dto/responses/auth_account.response.dto';
import { plainToInstance } from 'class-transformer';
import { AvailableAreasResDto } from './dto/responses/available_areas.res.dto';
import { AvailableStaffResDto } from './dto/responses/available_staff.res';
import { ChangeUserDto } from './dto/change_user.dto';
import { handleMysqlError } from 'src/common/utils/db-error-handler';
import { ChangePasswordDto } from './dto/change_password.dto';
import { ProfileResDto } from './dto/responses/profile_res.dto';
import { RolesAdminEntity } from '../roles_admin/entity/roles_admin.entity';
import { accountQueryOptions } from './account.constants';

@Injectable()
export class AuthAccountService {
    constructor(
        @InjectRepository(AuthAccountEntity) private accountRepo: Repository<AuthAccountEntity>,

        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,

        @InjectRepository(AreaEntity) private areaRepo: Repository<AreaEntity>,

        @InjectRepository(RolesAdminEntity) private rolerepo: Repository<RolesAdminEntity>,
    ){}

    private readonly SALT_ROUNDS = 10;

    private async hashPassword(password: string): Promise<string>{
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async getProfile(accountId: number): Promise<ProfileResDto>{
        const data = await this.accountRepo.findOne({
            where: { id: accountId },
            ...accountQueryOptions
        });

        if(!data){
            throw new BadRequestException({ accountId: `Cuenta no encontrada` });
        }

        const profile = ProfileResDto.fromEntity(data);

        return plainToInstance(ProfileResDto, profile, {
            excludeExtraneousValues: true
        })
    }

    async createAuthAccount(dto: AuthAccountDto): Promise<AuthAccountResponseDto>{
        const { user_codigo, password, managedAreaId } = dto;
        //User
        const user = await this.userRepo.findOne({ where: { codigo: user_codigo } });

        if(!user){
            throw new BadRequestException({ userCodigo: `Usuario no encontrado` });
        }

        const allowedRoles = [4,5,6];
        if(!allowedRoles.includes(user.idRol)){
            throw new BadRequestException({ userCodigo: `Este usuario no tiene privilegios para esta cuenta` })
        }

        const existingAccountByUser = await this.accountRepo.findOne({ where: { user: { codigo: user_codigo } } });
        if(existingAccountByUser){
            throw new BadRequestException({ userCodigo: `Este usuario, ya ha sido asignado a una área` })
        }
        //Area
        const area = await this.areaRepo.findOne({ where: { id: managedAreaId } });
        if(!area){
            throw new BadRequestException({ managedAreaId: `Área no encontrada` });
        }

        const existingAccountByArea = await this.accountRepo.findOne({ where: { managedArea: { id: managedAreaId } } });
        if(existingAccountByArea){
            throw new BadRequestException({ managedAreaId: `Esta área ya tiene una cuenta activa` })
        }

        const hashedPassword =  await this.hashPassword(password);

        const rolaAdmin = await this.rolerepo.findOne({ where: { id_tipo_area: area.id_tipo_area }, select: { id: true } });

        const newAuthAccount = this.accountRepo.create({
            user: user,
            password: hashedPassword,
            managedArea: { id: managedAreaId },
            id_rol_admin: rolaAdmin?.id
        })
        const savedAccount = await this.accountRepo.save(newAuthAccount);

        const account = await this.accountRepo.findOne({
            where: { id: savedAccount.id },
            ...accountQueryOptions
        })

        if(!account){
            throw new BadRequestException({ accountId: `Cuenta no encontrada` });
        }

        const result = AuthAccountResponseDto.fromEntity(account);

        return plainToInstance(AuthAccountResponseDto, result, {
            excludeExtraneousValues: true
        })
    }

    async getAuthAccounts(): Promise<AuthAccountResponseDto[]>{
        const accounts = await this.accountRepo.find({ 
            where: { id_rol_admin: Not(10) },
            ...accountQueryOptions,
            order: { createdAt: 'DESC' } 
        });

        const mappedData = accounts.map((a) => AuthAccountResponseDto.fromEntity(a) )

        return plainToInstance(AuthAccountResponseDto, mappedData, {
            excludeExtraneousValues: true
        })
    }

    async getAvailableAreas(): Promise<AvailableAreasResDto[]>{
        const rawData = await this.areaRepo.createQueryBuilder('areas')
            .select([ 'id', 'nombre' ])
            .where("NOT EXISTS (SELECT 1 FROM auth_accounts WHERE auth_accounts.managed_area_id = areas.id)")
            .getRawMany();
        
        const mappedData = rawData.map((a: AreaEntity) => AvailableAreasResDto.fromEntity(a));

        return plainToInstance(AvailableAreasResDto, mappedData, {
            excludeExtraneousValues: true
        })
    }

    async getAvailableStaff(): Promise<AvailableStaffResDto[]> {
        const rawData = await this.userRepo
            .createQueryBuilder('user')
            .select([ 'codigo', 'nombre' ])
            .where('idRol IN(4,5)')
            .andWhere("NOT EXISTS (SELECT 1 FROM auth_accounts WHERE auth_accounts.user_codigo = user.codigo)")
            .getRawMany();
        const mappedData = rawData.map((s: UserEntity) => AvailableStaffResDto.fromEntity(s));

        return plainToInstance(AvailableStaffResDto, mappedData, {
            excludeExtraneousValues: true
        })
    }

    async changeManagedUser( accountId: number, dto: ChangeUserDto): Promise<AuthAccountResponseDto>{
        try {
            const account = await this.accountRepo.findOneBy({ id: accountId });
            if(!account) throw new BadRequestException({ accountId: 'La cuenta no ha sido encontrada' })
            
            if(account.id_rol_admin === 10) throw new BadRequestException({ accountId: 'No tienes suficientes privilegios para realizar esta accion' })

            const user = await this.userRepo.findOne({ 
                select: {
                    codigo: true,
                    nombre: true,
                    idRol: true
                },
                where: {
                    codigo: dto.user_codigo
                }
             });

            if(!user) throw new BadRequestException({ user_codigo: 'Usuario no encontrado' })
            
            if(![4,5].includes(user.idRol)) throw new BadRequestException({ user_codigo: 'El usuario no tiene privilegios para ser asginado a esta cuenta' })
            
            const userExists = await this.accountRepo.findOneBy({ user_codigo: dto.user_codigo });

            if(userExists) throw new BadRequestException({ user_codigo: 'Este usuario ya tiene una cuenta activa, debes elegir otro' })

            const hashedPassword = await this.hashPassword(dto.password);
            account.user_codigo = dto.user_codigo;
            account.password = hashedPassword;

            await this.accountRepo.save(account)

            const updatedAccount = await this.accountRepo.findOneOrFail({
                where: { id: accountId },
                ...accountQueryOptions
            })
            
            const readDTO = {
                id: updatedAccount?.id,
                user_codigo: updatedAccount?.user_codigo,
                nombre: updatedAccount?.user.nombre,
                managedAreaId: String(updatedAccount?.managedArea.id),
                managedAreaName: updatedAccount?.managedArea.nombre,
                rolName: updatedAccount?.rolAdmin.nombre_cargo
            }
            return plainToInstance(AuthAccountResponseDto, readDTO, {
                excludeExtraneousValues: true
            })            
        } catch (error) {
            console.log(error)
            handleMysqlError(error)
        }
    }

    async changePassword(accountId: number, dto: ChangePasswordDto): Promise<void>{
        try {
            const account = await this.accountRepo.findOne({ where: { id: accountId }, select: { id: true, password: true } });

            if(!account) throw new BadRequestException({ accountId: 'La cuenta no ha sido encontrada' });

            const matchPassword = await bcrypt.compare(dto.oldPassword, account.password)

            if(!matchPassword) throw new BadRequestException({ oldPassword: 'La contraseña es incorrecta' })

            if(dto.newPassword === dto.oldPassword) throw new BadRequestException({ oldPassword: 'La nueva contraseña debe ser diferente a la anterior' })
                
            const hashedPassword = await this.hashPassword(dto.newPassword);

            account.password = hashedPassword;

            await this.accountRepo.save(account);

        } catch (error) {
            handleMysqlError(error)
        }
    }

    async deleteAccount(accountId: number): Promise<void>{
        try {
            const account = await this.accountRepo.findOneBy({ id: accountId });
            if(!account) throw new BadRequestException({ accountId: "La cuenta no ha sido encontrada" });

            if(account.id_rol_admin === 10) throw new BadRequestException({ accountId: "Esta cuenta no puede ser eliminada" })
            
            await this.accountRepo.delete(accountId);
        } catch (error) {
            handleMysqlError(error)
        }
    }
}
