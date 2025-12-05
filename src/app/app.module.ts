import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi, * as joi from 'joi';
import { DataSource } from 'typeorm';
@Module({
  imports: [
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
        ttl: 60000, //Janela de 1 minuto
        limit: 100, //100 requisicoes permitidas dentro de 1 minuto (1.6 por segundo)
        blockDuration: 30000, //Caso de 30 segundos caso abusem das requisicoes!
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
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger('Database-Connection'); //Nome que aparece antes das logs
  constructor(private dataSource: DataSource) {}

  public onModuleInit() {
    try {
      if (this.dataSource.isInitialized) {
        this.logger.log(
          '✅ Conexão com o banco de dados estabelecida com sucesso!',
        );
      } else {
        this.logger.warn(
          '⚠️ A conexão com o banco ainda não foi inicializada.',
        );
      }
    } catch (erro) {
      const error = erro as Error;
      this.logger.error(
        `❌ Erro ao conectar ao banco de dados: ${error.message}`,
      );
    }
  } //Quando iniciar a aplicacao ja roda
}
