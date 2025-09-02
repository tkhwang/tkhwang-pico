import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
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
  @UseGuards(JwtAuthGuard) // If you intend public access, ensure the RPC enforces is_public only.
  async getSimilarContents(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const safeLimit = Math.max(1, Math.min(50, limit));
    return this.contentsService.getSimilarContents(id, safeLimit);
  }
}
