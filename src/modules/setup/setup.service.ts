import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthAccountEntity } from '../auth_account/entity/auth_account.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entity/users.entity';
import { AreaEntity } from '../areas/entity/areas.entity';

@Injectable()
export class SetupService {
    constructor( 
        @InjectRepository(AuthAccountEntity) private repo: Repository<AuthAccountEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(AreaEntity) private areaRepo: Repository<AreaEntity>,
        private readonly config: ConfigService
    ){}

    async createRootUser(): Promise<void>{
        const rootCodigo = 'userRoot'; //this.config.get<string>('USER_CODE');
        const password = this.config.get<string>('USER_PASSWORD') || '123456';
        const managedAreaId = 43; //this.config.get<string>('USER_AREA');

        const authExists = await this.repo.findOne({ where: { user: { codigo: rootCodigo } }, relations: ['user'] });
        if(!authExists){
            const user = await this.userRepo.findOne({ where: { codigo: rootCodigo } });
            // const area = await this.areaRepo.findOne({ where: { id: user?.idArea } })
            const hashedPassword = await bcrypt.hash(password, 10);
            const rootAccount = this.repo.create({
                user: user as UserEntity,
                password: hashedPassword,
                managedArea: { id: managedAreaId}
            })
            await this.repo.save(rootAccount);
            console.log(`Account created for the user root.`)   
        }
    }
}
