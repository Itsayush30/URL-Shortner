import {
  Controller,
  Get,
  Post,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { Url } from './schemas/url.schema';

@Controller('url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Get('/all')
  async getAllNotes(): Promise<Url[]> {
    return this.urlService.findAll();
  }

  @Post()
  async generateNewShortUrl(
    @Body() body: { url: string },
  ): Promise<{ id: string }> {
    if (!body.url) {
      throw new BadRequestException('url is required');
    }
    const shortId = await this.urlService.createShortUrl(body.url);
    return { id: shortId };
  }
}
