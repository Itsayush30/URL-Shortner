import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
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
    //console.log('UserId', user._id);
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
    referrer: string[];
    userAgent: string[];
    browser: string[];
    platform: string[];
    host: string[];
  }> {
    const cachedAnalytics = await this.cacheService.get<{
      totalClicks: number;
      analytics: any[];
      referrer: string[];
      userAgent: string[];
      browser: string[];
      platform: string[];
      host: string[];
    }>(`analytics_${shortId}`);
    if (cachedAnalytics) {
      //console.log('check2', cachedAnalytics);
      return cachedAnalytics;
    } else {
      const result = await this.urlModel.findOne({ shortId });

      //console.log('result', result);

      if (!result) {
        throw new NotFoundException('Short URL not found');
      }

      const analytics = {
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
        referrer: result.referrer,
        userAgent: result.userAgent,
        browser: result.browser,
        platform: result.platform,
        host: result.host,
      };

      await this.cacheService.set(`analytics_${shortId}`, analytics);
      //console.log('checkAnalytics', analytics);
      return analytics;
    }
  }

  async redirectToOriginalUrl(shortId: string, headers: any): Promise<string> {
    
    const urlEntry = await this.urlModel.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: { timestamp: Date.now() },
          userAgent: headers['user-agent'],
          browser: headers['sec-ch-ua'],
          platform: headers['sec-ch-ua-platform'],
          host: headers.host,
          referrer: headers.referrer || headers.referer  || 'Unknown',
        },
      },
      { new: true },
    );

    if (!urlEntry) {
      throw new NotFoundException('URL not found');
    }

    // Update cache for analytics related to this short ID
    const updatedAnalytics = {
      totalClicks: urlEntry.visitHistory.length,
      analytics: urlEntry.visitHistory,
      userAgent: urlEntry.userAgent,
      browser: urlEntry.browser,
      platform: urlEntry.platform,
      referrer: urlEntry.referrer,
      host: urlEntry.host,
    };

    await this.cacheService.set(`analytics_${shortId}`, updatedAnalytics);

    return urlEntry.redirectURL;
  }

  async deleteUrlsOlderThan24Hours(): Promise<void> {
    //console.log("WORKING")
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.urlModel.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
  }
}
