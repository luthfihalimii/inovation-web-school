import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { QueryMajorDto } from './dto/query-major.dto';
import { MajorResponseDto, MajorsListResponseDto } from './dto/major-response.dto';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new major
   */
  async create(createMajorDto: CreateMajorDto): Promise<MajorResponseDto> {
    // Check if code already exists
    const existing = await this.prisma.major.findUnique({
      where: { code: createMajorDto.code },
    });

    if (existing) {
      throw new ConflictException('Kode jurusan sudah digunakan');
    }

    const major = await this.prisma.major.create({
      data: createMajorDto,
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            subjects: true,
          },
        },
      },
    });

    return new MajorResponseDto(major);
  }

  /**
   * Find all majors with pagination and filters
   */
  async findAll(query: QueryMajorDto): Promise<MajorsListResponseDto> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await this.prisma.major.count({ where });

    // Get paginated data
    const majors = await this.prisma.major.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            subjects: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = majors.map((major) => new MajorResponseDto(major));

    return new MajorsListResponseDto(data, total, page, limit);
  }

  /**
   * Find one major by ID
   */
  async findOne(id: string): Promise<MajorResponseDto> {
    const major = await this.prisma.major.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            subjects: true,
          },
        },
      },
    });

    if (!major) {
      throw new NotFoundException('Jurusan tidak ditemukan');
    }

    return new MajorResponseDto(major);
  }

  /**
   * Update a major
   */
  async update(id: string, updateMajorDto: UpdateMajorDto): Promise<MajorResponseDto> {
    // Check if major exists
    await this.findOne(id);

    // Check if code is being updated and already exists
    if (updateMajorDto.code) {
      const existing = await this.prisma.major.findFirst({
        where: {
          code: updateMajorDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Kode jurusan sudah digunakan');
      }
    }

    const major = await this.prisma.major.update({
      where: { id },
      data: updateMajorDto,
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            subjects: true,
          },
        },
      },
    });

    return new MajorResponseDto(major);
  }

  /**
   * Delete a major
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if major exists
    const major = await this.findOne(id);

    // Check if major has related data
    const studentCount = await this.prisma.student.count({
      where: { majorId: id },
    });

    const classCount = await this.prisma.class.count({
      where: { majorId: id },
    });

    if (studentCount > 0 || classCount > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus jurusan karena masih memiliki ${studentCount} siswa dan ${classCount} kelas`,
      );
    }

    await this.prisma.major.delete({
      where: { id },
    });

    return {
      message: `Jurusan ${major.name} berhasil dihapus`,
    };
  }
}
