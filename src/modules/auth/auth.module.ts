import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthAccountModule } from '../auth_account/auth_account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAccountEntity } from '../auth_account/entity/auth_account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthAccountEntity]),
    ConfigModule,
    AuthAccountModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string | number>('JWT_EXPIRES_IN');
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: typeof expiresIn === 'string' ? parseInt(expiresIn, 10) : expiresIn }
        };
      }
    })
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
