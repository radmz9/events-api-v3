import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthAccountEntity } from '../auth_account/entity/auth_account.entity';
import { LoginDto } from './dto/login.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { SuccessLoginResDto } from './dto/responses/succes_login.res.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthAccountEntity) private readonly repo: Repository<AuthAccountEntity>,
        private readonly jwtService: JwtService
    ){}

    async login(loginDto: LoginDto): Promise<SuccessLoginResDto>{
        const { user, password } = loginDto;

        const account = await this.repo.findOne({ 
            where: { user: { codigo: user } },
            // relations: ['user', 'managedArea', 'rolAdmin', 'managedArea.tipo'],
            relations: ['user', 'rolAdmin'],
            select: {
                id: true,
                password: true,
                user: {
                    id: true,
                    codigo: true,
                    nombre: true
                },
                managed_area_id: true
                // managedArea: {
                //     id: true, 
                //     nombre: true,
                //     tipo: true
                // }
            }
        });

        if(!account){
            throw new BadRequestException({ user: `${user} ${MESSAGES.USER_NOT_FOUND}` })
        }
        const matchPassword = await bcrypt.compare(password, account.password);
        if(!matchPassword){
            throw new BadRequestException({ password: MESSAGES.WRONG_PASSWORD })
        }
        
        const payload = { 
            sub: Number(account.id), 
            user: account.user.codigo,
            role: account.rolAdmin.alias, 
            idArea: account.managed_area_id
        }

        const token = this.jwtService.sign(payload)
        return {
            user: account.user.codigo,
            username: account.user.nombre,
            role: account.rolAdmin.alias,
            idArea: account.managed_area_id,
            token
        }
    }
}
