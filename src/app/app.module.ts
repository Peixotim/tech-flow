import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi, * as joi from 'joi';
import { CryptoModule } from 'src/crypto/crypto.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { LeadsModule } from 'src/leads/leads.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { CampaingsModule } from 'src/campaings/campaing.module';
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  messageFormat: '{msg} {context}',
                },
              }
            : undefined,
        autoLogging: false, //Deixa mais limpo o terminal
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        //Resumindo para cada 60 segundos uma pessoa pode fazer 100 requisicoes, se passar de 100 toma um block de 30 segundos
        ttl: 60000, //Janela de 1 minuto
        limit: 100, //100 requisicoes permitidas dentro de 1 minuto (1.6 por segundo)
        blockDuration: 420000, //Caso de 30 segundos caso abusem das requisicoes!
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, //Lembrete meu : Desativar quando subir para prod
      }),
    }),
    CryptoModule,
    UsersModule,
    AuthModule,
    LeadsModule,
    EnrollmentModule,
    CampaingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
