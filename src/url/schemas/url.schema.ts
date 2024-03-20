import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../auth/schemas/user.schema';
import mongoose from 'mongoose';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop([String]) // Change the type to an array of strings
  userAgent: string[];

  @Prop([String])
  host: string[];

  @Prop([String])
  platform: string[];

  @Prop([String])
  browser: string[];
}

export const UrlSchema = SchemaFactory.createForClass(Url);
