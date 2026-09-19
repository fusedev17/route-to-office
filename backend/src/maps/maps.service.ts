import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RouteResult } from './interfaces/route-result.interface.js';

interface DistanceMatrixElement {
  status: string;
  distance?: { text: string; value: number };
  duration?: { text: string; value: number };
  duration_in_traffic?: { text: string; value: number };
}

interface DistanceMatrixResponse {
  status: string;
  error_message?: string;
  rows: Array<{ elements: DistanceMatrixElement[] }>;
}

const DISTANCE_MATRIX_URL =
  'https://maps.googleapis.com/maps/api/distancematrix/json';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getRouteToCompany(
    originLat: number,
    originLng: number,
  ): Promise<RouteResult> {
    const apiKey = this.configService.get<string>('googleMapsApiKey');
    const destLat = this.configService.get<number>('companyLat')!;
    const destLng = this.configService.get<number>('companyLng')!;

    let data: DistanceMatrixResponse;
    try {
      const response = await firstValueFrom(
        this.httpService.get<DistanceMatrixResponse>(DISTANCE_MATRIX_URL, {
          params: {
            origins: `${originLat},${originLng}`,
            destinations: `${destLat},${destLng}`,
            departure_time: 'now',
            key: apiKey,
          },
        }),
      );
      data = response.data;
    } catch (error) {
      this.logger.error(
        'Failed to reach Google Distance Matrix API',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Unable to reach Google Maps service',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (data.status !== 'OK') {
      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new HttpException(
          'Google Maps API quota exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new HttpException(
        data.error_message ?? `Google Maps API returned status: ${data.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK' || !element.distance || !element.duration) {
      throw new HttpException(
        'No route found between the given locations',
        HttpStatus.NOT_FOUND,
      );
    }

    const duration = element.duration_in_traffic ?? element.duration;

    return {
      distanceText: element.distance.text,
      distanceValue: element.distance.value,
      durationText: duration.text,
      durationValue: duration.value,
      originLat,
      originLng,
      destLat,
      destLng,
    };
  }
}
