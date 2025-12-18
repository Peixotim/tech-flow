import { forwardRef, Module } from '@nestjs/common';
import { PlaybookController } from './playbook.controller';
import { PlaybookService } from './playbook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaybookEntity } from './entity/playbook.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
  controllers: [PlaybookController],
  imports: [
    TypeOrmModule.forFeature([PlaybookEntity]),
    forwardRef(() => UsersModule),
  ],
  providers: [PlaybookService],
  exports: [PlaybookService],
})
export class PlaybookModule {}
