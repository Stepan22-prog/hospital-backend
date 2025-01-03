import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequestDto } from './dto/signIn.dto';
import { Public } from '../decorators/public.decorator';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInRequestDto,
  ) {
    return this.authService.signIn(response, signInDto);
  }

  @Public()
  @Get('access-token')
  async getNewTokens(@Req() req: Request) {
    const refreshToken = this.getRefreshTokenFromCookies(req);

    return this.authService.getNewAccessToken(refreshToken);
  }

  private getRefreshTokenFromCookies(req: Request): string {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not passed');
    }
    return refreshToken;
  }

  @Public()
  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return { success: true };
  }
}
