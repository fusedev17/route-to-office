import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller.js';
import { MapsService } from './maps.service.js';

@Module({
  imports: [HttpModule],
  controllers: [MapsController],
  providers: [MapsService],
})
export class MapsModule {}
