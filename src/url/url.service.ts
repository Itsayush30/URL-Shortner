import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from './schemas/url.schema';
import * as shortid from 'shortid';
import { User } from '../auth/schemas/user.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url.name)
    private readonly urlModel: Model<Url>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async findAll(): Promise<Url[]> {
    return await this.urlModel.find().exec();
  }

  async createShortUrl(url: string, user: User): Promise<string> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    const shortId = shortid.generate();
    console.log('here2', user._id);
    await this.urlModel.create({
      shortId,
      redirectURL: url,
      visitHistory: [],
      userAgent: [],
      user: user._id,
    });
    return shortId;
  }

  async getAnalytics(shortId: string): Promise<{
    totalClicks: number;
    analytics: any[];
    userAgent: string[];
    browser: string[];
    platform: string[];
    host: string[];
  }> {
    const cachedAnalytics = await this.cacheService.get<{
      totalClicks: number;
      analytics: any[];
      userAgent: string[];
      browser: string[];
      platform: string[];
      host: string[];
    }>(`analytics_${shortId}`);
    if (cachedAnalytics) {
      console.log("check2",cachedAnalytics)
      return cachedAnalytics;
    } else {
      const result = await this.urlModel.findOne({ shortId });

      console.log('result', result);

      if (!result) {
        throw new NotFoundException('Short URL not found');
      }

      const analytics = {
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
        userAgent: result.userAgent,
        browser: result.browser,
        platform: result.platform,
        host: result.host,
      };

      await this.cacheService.set(`analytics_${shortId}`, analytics);
      console.log("check",analytics)
      return analytics;
    }
  }

  async redirectToOriginalUrl(shortId: string, headers: any): Promise<string> {
    console.log('here3', headers.host);
    const urlEntry = await this.urlModel.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: { timestamp: Date.now() },
          userAgent: headers['user-agent'],
          browser: headers['sec-ch-ua'],
          platform: headers['sec-ch-ua-platform'],
          host: headers.host,
        },
      },
      { new: true },
    );

    if (!urlEntry) {
      throw new NotFoundException('URL not found');
    }

    return urlEntry.redirectURL;
  }

  async deleteUrlsOlderThan24Hours(): Promise<void> {
    //console.log("WORKING")
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.urlModel.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
  }
}
