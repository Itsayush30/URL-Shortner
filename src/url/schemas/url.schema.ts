import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema({
  timestamps: true,
})
export class Url {
  @Prop()
  title: string;

  @Prop()
  note: string;

  @Prop()
  author: string;


  @Prop()
  specialnote: string;


}

export const UrlSchema = SchemaFactory.createForClass(Url);