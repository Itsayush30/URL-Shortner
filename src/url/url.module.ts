import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlSchema } from './schemas/url.schema';


@Module({
  imports: [ MongooseModule.forFeature([{ name: 'Url', schema: UrlSchema }])],
  controllers: [UrlController],
  providers: [UrlService]
})
export class UrlModule {}
