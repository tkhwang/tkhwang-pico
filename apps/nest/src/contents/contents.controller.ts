import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { SaveContentDto } from 'src/contents/contents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async save(@UserId() userId: string, @Body() saveContentDto: SaveContentDto) {
    return this.contentsService.saveUrl({
      url: saveContentDto.url,
      userId,
      isPublic: saveContentDto.isPublic ?? false,
    });
  }

  @Get(':id/similar')
  async getSimilarContents(
    @Param('id') id: string,
    @Query('limit') limit = 10,
  ) {
    return this.contentsService.getSimilarContents(id, Number(limit));
  }
}
