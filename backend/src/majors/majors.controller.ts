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
import { MajorsService } from './majors.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { QueryMajorDto } from './dto/query-major.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('majors')
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) {}

  /**
   * Create a new major
   * POST /api/majors
   * @access Admin only
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorsService.create(createMajorDto);
  }

  /**
   * Get all majors with pagination and filters
   * GET /api/majors
   * @access Public
   */
  @Get()
  findAll(@Query() query: QueryMajorDto) {
    return this.majorsService.findAll(query);
  }

  /**
   * Get a major by ID
   * GET /api/majors/:id
   * @access Public
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.majorsService.findOne(id);
  }

  /**
   * Update a major
   * PATCH /api/majors/:id
   * @access Admin only
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
    return this.majorsService.update(id, updateMajorDto);
  }

  /**
   * Delete a major
   * DELETE /api/majors/:id
   * @access Admin only
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.majorsService.remove(id);
  }
}
