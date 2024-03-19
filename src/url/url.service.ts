import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Url } from './schemas/url.schema';
import { v4 as uuidv4 } from 'uuid'; // Import v4 function from uuid package



@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url.name)
    private urlModel: mongoose.Model<Url>,
  ) {}

  async findAll(): Promise<Url[]>{
    const url = await this.urlModel.find();
    return url;
}

async createShortUrl(url: string): Promise<string> {
    const shortID = uuidv4(); // Generate UUID using uuidv4 function
    await this.urlModel.create({
      shortId: shortID,
      redirectURL: url,
      visitHistory: [],
    });
    return shortID;
  }

}
