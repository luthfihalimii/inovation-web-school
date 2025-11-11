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
import { StudentsService } from './students.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Get all students with pagination and filters
   * GET /api/students
   * @access Admin, Teacher
   */
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll(@Query() query: QueryStudentDto) {
    return this.studentsService.findAll(query);
  }

  /**
   * Get current student profile
   * GET /api/students/me
   * @access Student (own profile)
   */
  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getMyProfile(@CurrentUser() user: any) {
    return this.studentsService.findByUserId(user.id);
  }

  /**
   * Get a student by ID
   * GET /api/students/:id
   * @access Admin, Teacher
   */
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  /**
   * Update a student
   * PATCH /api/students/:id
   * @access Admin, Teacher
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  /**
   * Delete (deactivate) a student
   * DELETE /api/students/:id
   * @access Admin only
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
