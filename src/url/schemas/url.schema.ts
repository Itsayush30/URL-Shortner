import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Url {
  @Prop({ required: true, unique: true })
  shortId: string;

  @Prop({ required: true })
  redirectURL: string;

  @Prop([{ timestamp: Number }])
  visitHistory: { timestamp: number }[];
}

export const UrlSchema = SchemaFactory.createForClass(Url);
 