import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SaveContentDto } from 'src/contents/contents.dto';

import { UserId } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ContentsService } from './contents.service';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async save(@UserId() userId: string, @Body() saveContentDto: SaveContentDto) {
    return this.contentsService.saveUrl({
      url: saveContentDto.url,
      userId,
    });
  }

  @Get(':id/similar')
  @UseGuards(JwtAuthGuard)
  async getSimilarContents(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const safeLimit = Math.max(1, Math.min(50, limit));
    return this.contentsService.getSimilarContents(id, safeLimit);
  }
}
