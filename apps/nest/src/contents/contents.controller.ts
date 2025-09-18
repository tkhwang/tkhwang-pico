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
import {
  QUERY_SIMIAR_CONTENTS_DEFAULT_LIMIT,
  QUERY_SIMIAR_CONTENTS_MAX_QUERY_LIMIT,
} from 'src/consts/app-consts';
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
    @UserId() userId: string,
    @Param('id') id: string,
    @Query(
      'limit',
      new DefaultValuePipe(QUERY_SIMIAR_CONTENTS_DEFAULT_LIMIT),
      ParseIntPipe,
    )
    limit: number,
  ) {
    const safeLimit = Math.max(
      1,
      Math.min(QUERY_SIMIAR_CONTENTS_MAX_QUERY_LIMIT, limit),
    );
    return this.contentsService.getSimilarContents(userId, id, safeLimit);
  }
}
