import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterStudentDto,
  RegisterTeacherDto,
  RegisterParentDto,
  RegisterAdminDto,
} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register Student
   * POST /auth/register/student
   */
  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.register(dto);
  }

  /**
   * Register Teacher
   * POST /auth/register/teacher
   */
  @Post('register/teacher')
  @HttpCode(HttpStatus.CREATED)
  async registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.authService.register(dto);
  }

  /**
   * Register Parent
   * POST /auth/register/parent
   */
  @Post('register/parent')
  @HttpCode(HttpStatus.CREATED)
  async registerParent(@Body() dto: RegisterParentDto) {
    return this.authService.register(dto);
  }

  /**
   * Register Admin
   * POST /auth/register/admin
   */
  @Post('register/admin')
  @HttpCode(HttpStatus.CREATED)
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.register(dto);
  }

  /**
   * Login
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Logout
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authorization: string) {
    const sessionToken = this.extractSessionToken(authorization);
    return this.authService.logout(sessionToken);
  }

  /**
   * Get current session
   * GET /auth/session
   */
  @Get('session')
  async getSession(@Headers('authorization') authorization: string) {
    const sessionToken = this.extractSessionToken(authorization);
    const user = await this.authService.getUserBySessionToken(sessionToken);

    if (!user) {
      throw new UnauthorizedException('Session tidak valid');
    }

    return { user };
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  @Get('me')
  async getProfile(@Headers('authorization') authorization: string) {
    const sessionToken = this.extractSessionToken(authorization);
    const user = await this.authService.getUserBySessionToken(sessionToken);

    if (!user) {
      throw new UnauthorizedException('Session tidak valid');
    }

    return this.authService.getProfile(user.id);
  }

  /**
   * Extract session token from Authorization header
   */
  private extractSessionToken(authorization: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    // Support both "Bearer token" and "token" formats
    const token = authorization.startsWith('Bearer ')
      ? authorization.substring(7)
      : authorization;

    if (!token) {
      throw new UnauthorizedException('Token tidak valid');
    }

    return token;
  }
}
