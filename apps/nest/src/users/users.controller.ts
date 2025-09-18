import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QUERY_SIMILAR_CONTENTS_MAX_QUERY_LIMIT } from 'src/consts/app-consts';

import { UserId, UserToken } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(
    @UserToken() token: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('lang') lang?: string,
  ) {
    const safeLimit = Math.max(
      1,
      Math.min(QUERY_SIMILAR_CONTENTS_MAX_QUERY_LIMIT, limit),
    );
    return this.usersService.getRecommendations(token, safeLimit, lang);
  }

  @Delete('contents/:id')
  @UseGuards(JwtAuthGuard)
  async deleteUserContent(
    @UserId() userId: string,
    @Param('id') contentId: string,
  ) {
    return this.usersService.deleteUserContent(userId, contentId);
  }
}
