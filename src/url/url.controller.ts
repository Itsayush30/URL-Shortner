import {
  Controller,
  Get,
  Post,
  BadRequestException,
  Body,
  Param,
  NotFoundException,
  Redirect,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { Url } from './schemas/url.schema';

@Controller()
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

  @Get('analytics/:shortId')
  async getAnalytics(@Param('shortId') shortId: string) {
    try {
      return await this.urlService.getAnalytics(shortId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Short URL not found');
      }
      throw error;
    }
  }

  @Get(':shortId')
  @Redirect('', 302)
  async redirectToOriginalUrl(@Param('shortId') shortId: string) {
    try {
      const redirectURL = await this.urlService.redirectToOriginalUrl(shortId);
      return { url: redirectURL };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Short URL not found');
      }
      throw error;
    }
  }
}
