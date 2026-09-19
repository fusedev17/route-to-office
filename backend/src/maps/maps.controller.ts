import { Controller, Get, Query } from '@nestjs/common';
import { GetRouteDto } from './dto/get-route.dto.js';
import { RouteResult } from './interfaces/route-result.interface.js';
import { MapsService } from './maps.service.js';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('route')
  getRoute(@Query() query: GetRouteDto): Promise<RouteResult> {
    return this.mapsService.getRouteToCompany(query.lat, query.lng);
  }
}
