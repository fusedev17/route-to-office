import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { MapsService } from '../src/maps/maps.service.js';

const CONFIG_VALUES: Record<string, string | number> = {
  googleMapsApiKey: 'test-api-key',
  companyLat: 13.805432,
  companyLng: 100.5377344,
};

function buildAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };
}

describe('MapsService', () => {
  let service: MapsService;
  let httpService: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    httpService = { get: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapsService,
        { provide: HttpService, useValue: httpService },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => CONFIG_VALUES[key] },
        },
      ],
    }).compile();

    service = module.get<MapsService>(MapsService);
  });

  it('returns the mapped route when Google responds with OK', async () => {
    httpService.get.mockReturnValueOnce(
      of(
        buildAxiosResponse({
          status: 'OK',
          rows: [
            {
              elements: [
                {
                  status: 'OK',
                  distance: { text: '5.2 km', value: 5200 },
                  duration: { text: '12 mins', value: 720 },
                  duration_in_traffic: { text: '18 mins', value: 1080 },
                },
              ],
            },
          ],
        }),
      ),
    );

    const result = await service.getRouteToCompany(13.75, 100.5);

    expect(result).toEqual({
      distanceText: '5.2 km',
      distanceValue: 5200,
      durationText: '18 mins',
      durationValue: 1080,
      originLat: 13.75,
      originLng: 100.5,
      destLat: 13.805432,
      destLng: 100.5377344,
    });
  });

  it('falls back to duration when duration_in_traffic is missing', async () => {
    httpService.get.mockReturnValueOnce(
      of(
        buildAxiosResponse({
          status: 'OK',
          rows: [
            {
              elements: [
                {
                  status: 'OK',
                  distance: { text: '5.2 km', value: 5200 },
                  duration: { text: '12 mins', value: 720 },
                },
              ],
            },
          ],
        }),
      ),
    );

    const result = await service.getRouteToCompany(13.75, 100.5);

    expect(result.durationText).toBe('12 mins');
    expect(result.durationValue).toBe(720);
  });

  it('throws 429 when Google reports OVER_QUERY_LIMIT', async () => {
    httpService.get.mockReturnValueOnce(
      of(buildAxiosResponse({ status: 'OVER_QUERY_LIMIT', rows: [] })),
    );

    await expect(service.getRouteToCompany(13.75, 100.5)).rejects.toMatchObject(
      new HttpException('Google Maps API quota exceeded', HttpStatus.TOO_MANY_REQUESTS),
    );
  });

  it('throws a bad gateway error for other non-OK top-level statuses', async () => {
    httpService.get.mockReturnValueOnce(
      of(
        buildAxiosResponse({
          status: 'REQUEST_DENIED',
          error_message: 'The provided API key is invalid.',
          rows: [],
        }),
      ),
    );

    await expect(service.getRouteToCompany(13.75, 100.5)).rejects.toMatchObject(
      new HttpException('The provided API key is invalid.', HttpStatus.BAD_GATEWAY),
    );
  });

  it('throws 404 when no route element is found', async () => {
    httpService.get.mockReturnValueOnce(
      of(
        buildAxiosResponse({
          status: 'OK',
          rows: [{ elements: [{ status: 'ZERO_RESULTS' }] }],
        }),
      ),
    );

    await expect(service.getRouteToCompany(13.75, 100.5)).rejects.toMatchObject(
      new HttpException(
        'No route found between the given locations',
        HttpStatus.NOT_FOUND,
      ),
    );
  });

  it('throws a bad gateway error when the HTTP request itself fails', async () => {
    httpService.get.mockReturnValueOnce(
      throwError(() => new Error('Network error')),
    );

    await expect(service.getRouteToCompany(13.75, 100.5)).rejects.toMatchObject(
      new HttpException('Unable to reach Google Maps service', HttpStatus.BAD_GATEWAY),
    );
  });
});
