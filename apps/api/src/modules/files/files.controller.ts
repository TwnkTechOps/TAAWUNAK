import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {FilesService} from './files.service';
import {JwtAuthGuard} from '../auth/jwt.guard';

@Controller('files')
export class FilesController {
  constructor(private files: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('presign')
  async presign(@Body() body: {key: string; contentType: string}) {
    return this.files.presignPut(body.key, body.contentType);
  }
}


