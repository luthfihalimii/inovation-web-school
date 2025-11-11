import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  /**
   * Create a new class
   * POST /api/classes
   * @access Admin only
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  /**
   * Get all classes with pagination and filters
   * GET /api/classes
   * @access Public
   */
  @Get()
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }

  /**
   * Get a class by ID
   * GET /api/classes/:id
   * @access Public
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  /**
   * Get students in a class
   * GET /api/classes/:id/students
   * @access Teacher, Admin
   */
  @Get(':id/students')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getStudents(@Param('id') id: string) {
    return this.classesService.getStudents(id);
  }

  /**
   * Update a class
   * PATCH /api/classes/:id
   * @access Admin only
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  /**
   * Delete a class
   * DELETE /api/classes/:id
   * @access Admin only
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
