import {
  Controller,
  Get,
  Post,
  BadRequestException,
  Body,
  Param,
  NotFoundException,
  Redirect,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { Url } from './schemas/url.schema';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller()
export class UrlController {
  constructor(private urlService: UrlService) {}

  @UseInterceptors(CacheInterceptor) // Automatically cache the response for this endpoint
  @Get('/all')
  async getAllNotes(): Promise<Url[]> {
    return this.urlService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard(), ThrottlerGuard)
  async generateNewShortUrl(
    @Body() body: { url: string },
    @Req() req,
  ): Promise<{ id: string }> {
    if (!body.url) {
      throw new BadRequestException('url is required');
    }
    //console.log("check"req.user._id)
    const shortId = await this.urlService.createShortUrl(body.url, req.user);
    return { id: shortId };
  }

  @Get('analytics/:shortId')
  @UseGuards(AuthGuard(), ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
  @Redirect('', 302)
  async redirectToOriginalUrl(
    @Param('shortId') shortId: string,
    @Req() request: Request,
  ) {
    try {
      //console.log(request.headers);
      const redirectURL = await this.urlService.redirectToOriginalUrl(
        shortId,
        request.headers,
      );
      return { url: redirectURL };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Short URL not found');
      }
      throw error;
    }
  }

  @Post('delete-old-urls')
  @UseGuards(ThrottlerGuard)
  async deleteOldUrls() {
    await this.urlService.deleteUrlsOlderThan24Hours();
    return { message: 'Old URLs deleted successfully' };
  }
}
