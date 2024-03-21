import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { UrlService } from './url.service';
import { Url } from './schemas/url.schema';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';


describe('UrlService', () => {
  let service: UrlService;
  let mockUrlModel: any;
  let mockCacheService: Partial<Cache>;

  beforeEach(async () => {
    mockUrlModel = {
      findOneAndUpdate: jest.fn(),
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: getModelToken(Url.name), useValue: mockUrlModel },
        { provide: CACHE_MANAGER, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redirectToOriginalUrl', () => {
    it('should return the original URL', async () => {
      const shortId = 'mock_short_id';
      const headers = {
        host: 'xyz.com',
        'user-agent': 'Mozilla/5.0',
        'sec-ch-ua': 'Google Chrome',
        'sec-ch-ua-platform': 'macOS',
      };

      const mockUrlEntry = {
        redirectURL: 'https://xyz.com/original-url',
      };

      mockUrlModel.findOneAndUpdate.mockResolvedValue(mockUrlEntry);

      const result = await service.redirectToOriginalUrl(shortId, headers);

      expect(result).toEqual(mockUrlEntry.redirectURL);
      expect(mockUrlModel.findOneAndUpdate).toHaveBeenCalledWith(
        { shortId },
        {
          $push: {
            visitHistory: { timestamp: expect.any(Number) },
            userAgent: headers['user-agent'],
            browser: headers['sec-ch-ua'],
            platform: headers['sec-ch-ua-platform'],
            host: headers.host,
          },
        },
        { new: true },
      );
    });

    it('should throw NotFoundException if URL not found', async () => {
      const shortId = 'non_existing_short_id';
      const headers = {
        host: 'xyz.com',
        'user-agent': 'Mozilla/5.0',
        'sec-ch-ua': 'Google Chrome',
        'sec-ch-ua-platform': 'macOS',
      };

      mockUrlModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(service.redirectToOriginalUrl(shortId, headers)).rejects.toThrowError(NotFoundException);
    });
  });
});
