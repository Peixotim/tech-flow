import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([])],
})
export class CampaingsModule {}
