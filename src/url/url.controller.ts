import { Controller,Get } from '@nestjs/common';
import { UrlService } from './url.service';
import { Url } from './schemas/url.schema';

@Controller('url')
export class UrlController {

    constructor(private noteService: UrlService) {}

  @Get("/all")
  async getAllNotes(): Promise<Url[]> {
    return this.noteService.findAll();
  }

}
