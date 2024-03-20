import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UrlService } from './url.service';

@Injectable()
export class UrlDeletionSchedulerService {
  constructor(private urlService: UrlService) {}

  @Cron('0 0 * * *') // Runs every midnight
  async handleUrlDeletion() {
    try {
      await this.urlService.deleteUrlsOlderThan24Hours();
    } catch (error) {
      console.log(error);
    }
  }
}
