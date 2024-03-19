import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Url } from './schemas/url.schema';

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

}
