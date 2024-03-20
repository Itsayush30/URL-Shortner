import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from './schemas/url.schema';
import * as shortid from 'shortid';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url.name)
    private readonly urlModel: Model<Url>,
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
      user: user._id,
    });
    return shortId;
  }

  async getAnalytics(
    shortId: string,
  ): Promise<{ totalClicks: number; analytics: any[] }> {
    const result = await this.urlModel.findOne({ shortId });

    if (!result) {
      throw new NotFoundException('Short URL not found');
    }

    return {
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    };
  }

  async redirectToOriginalUrl(shortId: string): Promise<string> {
    const urlEntry = await this.urlModel.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
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
