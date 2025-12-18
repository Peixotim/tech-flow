import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
