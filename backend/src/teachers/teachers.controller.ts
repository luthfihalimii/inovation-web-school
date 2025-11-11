import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  /**
   * Get all teachers with pagination and filters
   * GET /api/teachers
   * @access Admin, Teacher
   */
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll(@Query() query: QueryTeacherDto) {
    return this.teachersService.findAll(query);
  }

  /**
   * Get current teacher profile
   * GET /api/teachers/me
   * @access Teacher (own profile)
   */
  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getMyProfile(@CurrentUser() user: any) {
    return this.teachersService.findByUserId(user.id);
  }

  /**
   * Get a teacher by ID
   * GET /api/teachers/:id
   * @access Admin, Teacher
   */
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  /**
   * Update a teacher
   * PATCH /api/teachers/:id
   * @access Admin, Teacher (own profile)
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  /**
   * Delete (deactivate) a teacher
   * DELETE /api/teachers/:id
   * @access Admin only
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
