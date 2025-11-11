import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { StudentResponseDto, StudentsListResponseDto } from './dto/student-response.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all students with pagination and filters
   */
  async findAll(query: QueryStudentDto): Promise<StudentsListResponseDto> {
    const { page = 1, limit = 10, search, classId, majorId, enrollmentYear, isActive } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nis: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (classId) {
      where.classId = classId;
    }

    if (majorId) {
      where.majorId = majorId;
    }

    if (enrollmentYear) {
      where.enrollmentYear = enrollmentYear;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await this.prisma.student.count({ where });

    // Get paginated data
    const students = await this.prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            nik: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { nis: 'asc' },
    });

    const data = students.map((student) => new StudentResponseDto(student));

    return new StudentsListResponseDto(data, total, page, limit);
  }

  /**
   * Find one student by ID
   */
  async findOne(id: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            nik: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    return new StudentResponseDto(student);
  }

  /**
   * Find student by user ID
   */
  async findByUserId(userId: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            nik: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    return new StudentResponseDto(student);
  }

  /**
   * Update a student
   */
  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentResponseDto> {
    // Check if student exists
    await this.findOne(id);

    // Validate references if being updated
    if (updateStudentDto.classId) {
      const classData = await this.prisma.class.findUnique({
        where: { id: updateStudentDto.classId },
      });

      if (!classData) {
        throw new NotFoundException('Kelas tidak ditemukan');
      }
    }

    if (updateStudentDto.majorId) {
      const major = await this.prisma.major.findUnique({
        where: { id: updateStudentDto.majorId },
      });

      if (!major) {
        throw new NotFoundException('Jurusan tidak ditemukan');
      }
    }

    if (updateStudentDto.parentId) {
      const parent = await this.prisma.parent.findUnique({
        where: { id: updateStudentDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Data orang tua tidak ditemukan');
      }
    }

    // Convert dateOfBirth to Date if provided
    const updateData: any = { ...updateStudentDto };
    if (updateStudentDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            nik: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return new StudentResponseDto(student);
  }

  /**
   * Delete (deactivate) a student
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if student exists
    const student = await this.findOne(id);

    // Deactivate instead of delete
    await this.prisma.student.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: `Siswa ${student.user?.name} berhasil dinonaktifkan`,
    };
  }
}
