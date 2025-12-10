import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app/app.module';
import { UsersService } from 'src/users/users.service';
import { Logger } from '@nestjs/common';
import { UsersMasterCreateDTO } from 'src/users/DTOs/users-master-create.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const logger = new Logger('SeedMaster');

  const args = process.argv.slice(2);
  const [name, email, password] = args;

  if (!name || !email || !password) {
    logger.error('Uso: pnpm run seed:master -- "Name" "Email" "Password"');
    await app.close();
    process.exit(1);
  }

  try {
    const dto: UsersMasterCreateDTO = { name, email, password };
    const user = await usersService.createMaster(dto);
    logger.log(`Master user created : ${user.email} (UUID: ${user.uuid})`);
  } catch (error) {
    logger.error(`Error creating master user ! ${error}`);
  } finally {
    await app.close();
  }
}
bootstrap();
