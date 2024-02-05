import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'hojanubereats';
const REGION = 'ap-northeast-2';
const AMAZONURL = 'amazonaws.com';
@Controller('uploads')
export class UploadsController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AMAZONS3ACCESSKEYID,
        secretAccessKey: process.env.AMAZONS3SECRETKEY,
      },
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3({ region: REGION })
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.${AMAZONURL}/${objectName}`;
      return { url: fileUrl };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
