import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { Logger as NestLogger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  if (process.env.NODE_ENV === 'production') {
    app.useLogger(app.get(PinoLogger));
  } else {
    app.useLogger(new NestLogger());
  }

  const logger =
    process.env.NODE_ENV === 'production'
      ? app.get(PinoLogger)
      : new NestLogger('Bootstrap');

  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    logger.log('Database: Connected and Ready to Use!');
  } else {
    logger.error('Critical Error: The Database did not connect!');
    process.exit(1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  const descriptionMarkdown = `
  ### 📚 Visão Geral
  Bem-vindo à API oficial da **Tech - Flow**.
  Esta plataforma permite o controle de leads e integrações B2B.

  ---

  ### ⚡ Recursos Principais
  
| Módulo | Descrição |
  | :--- | :--- |
  | **Auth** | Gerenciamento de sessões e tokens JWT |
  | **Leads** | Captura e distribuição inteligente de contatos |
  | **Enterprise** | Empresas de onde cada Lead vem |

  ---

  ### 🔐 Como Autenticar
  > A API utiliza o padrão **Bearer Token**.
  
  1. Faça login na rota \`POST /auth/login\`.
  2. Copie o \`access_token\` retornado.
  3. Clique no botão **Authorize** (acima) e cole o token.
  `;

  const config = new DocumentBuilder()
    .setTitle('Tech - Flow API')
    .setDescription(descriptionMarkdown)
    .setVersion('1.0.0')
    .setContact(
      'Suporte Tech - Flow',
      'https://tech-flow.com',
      'pedropeixotovz@gmail.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Cole seu token JWT aqui',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:8080', 'Desenvolvimento')
    .addServer('https://api.tech-flow.com', 'Produção')
    .build();

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Documentação Tech - Flow',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      tryItOutEnabled: true,
    },

    customCss: `
      /* Fonte Moderna */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
      
      body { font-family: 'Inter', sans-serif !important; background-color: #fafafa; }
      
      /* Esconde barra verde padrão */
      .swagger-ui .topbar { display: none; }

      /* Estiliza o Bloco de Informação Principal */
      .swagger-ui .info {
        background-color: #ffffff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        margin: 40px 0;
      }

      .swagger-ui .info .title { font-weight: 700; color: #1a1a1a; font-size: 32px !important; }
      .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info table { font-size: 16px; color: #4a4a4a; }
      
      /* Tabelas no Markdown */
      .swagger-ui .info table { border-collapse: collapse; width: 80%; margin: 20px 0; }
      .swagger-ui .info th { background-color: #f3f4f6; padding: 10px; text-align: left; border-radius: 4px; }
      .swagger-ui .info td { padding: 10px; border-bottom: 1px solid #eee; }

      /* Botão Authorize Profissional (Preto e Branco) */
      .swagger-ui .btn.authorize {
        background-color: #000000;
        color: white;
        border-radius: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: none;
      }
      .swagger-ui .btn.authorize svg { fill: white; }

      /* Melhoria nas Tags (Pastas dos Controllers) */
      .swagger-ui .opblock-tag {
        font-size: 18px;
        border-bottom: 1px solid #eee;
        padding: 15px 0;
      }
      
      /* Remove bordas feias */
      .swagger-ui .scheme-container { background: transparent; box-shadow: none; border: none; }
    `,
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, customOptions);

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  logger.log(
    `Tech - Flow API is running on: http://localhost:${port}/api-docs`,
  );
}
bootstrap();
