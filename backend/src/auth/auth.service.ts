import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  RegisterStudentDto,
  RegisterTeacherDto,
  RegisterParentDto,
  RegisterAdminDto,
} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UserResponseDto,
  StudentResponseDto,
  TeacherResponseDto,
  ParentResponseDto,
  AdminResponseDto,
  AuthResponseDto,
} from './dto/user-response.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generic user registration
   */
  async register(
    dto:
      | RegisterStudentDto
      | RegisterTeacherDto
      | RegisterParentDto
      | RegisterAdminDto,
  ): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Create user based on role
    let user: any;

    switch (dto.role) {
      case UserRole.STUDENT:
        user = await this.registerStudent(dto as RegisterStudentDto, hashedPassword);
        break;
      case UserRole.TEACHER:
        user = await this.registerTeacher(dto as RegisterTeacherDto, hashedPassword);
        break;
      case UserRole.PARENT:
        user = await this.registerParent(dto as RegisterParentDto, hashedPassword);
        break;
      case UserRole.ADMIN:
        user = await this.registerAdmin(dto as RegisterAdminDto, hashedPassword);
        break;
      default:
        throw new BadRequestException('Role tidak valid');
    }

    return new AuthResponseDto({
      user,
      message: 'Registrasi berhasil',
    });
  }

  /**
   * Register Student
   */
  private async registerStudent(
    dto: RegisterStudentDto,
    hashedPassword: string,
  ) {
    // Check if NIS or NISN already exists
    const existingStudent = await this.prisma.student.findFirst({
      where: {
        OR: [{ nis: dto.nis }, { nisn: dto.nisn }],
      },
    });

    if (existingStudent) {
      throw new ConflictException('NIS atau NISN sudah terdaftar');
    }

    // Check if major exists
    const major = await this.prisma.major.findUnique({
      where: { id: dto.majorId },
    });

    if (!major) {
      throw new NotFoundException('Jurusan tidak ditemukan');
    }

    // Check if class exists (if provided)
    if (dto.classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });

      if (!classExists) {
        throw new NotFoundException('Kelas tidak ditemukan');
      }
    }

    // Create user with student profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Account with hashed password
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: UserRole.STUDENT,
          image: dto.image,
          emailVerified: false,
        },
      });

      // Create account with password
      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          access_token: hashedPassword, // Store hashed password here
        },
      });

      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          nis: dto.nis,
          nisn: dto.nisn,
          majorId: dto.majorId,
          classId: dto.classId,
          dateOfBirth: new Date(dto.dateOfBirth),
          placeOfBirth: dto.placeOfBirth,
          gender: dto.gender,
          address: dto.address,
          phone: dto.phone,
          parentId: dto.parentId,
          enrollmentYear: new Date().getFullYear(),
        },
        include: {
          user: true,
          major: true,
          class: true,
        },
      });

      return student;
    });

    return new StudentResponseDto(result);
  }

  /**
   * Register Teacher
   */
  private async registerTeacher(
    dto: RegisterTeacherDto,
    hashedPassword: string,
  ) {
    // Check if NIP already exists
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { nip: dto.nip },
    });

    if (existingTeacher) {
      throw new ConflictException('NIP sudah terdaftar');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: UserRole.TEACHER,
          image: dto.image,
          emailVerified: false,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          access_token: hashedPassword,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          nip: dto.nip,
          dateOfBirth: new Date(dto.dateOfBirth),
          placeOfBirth: dto.placeOfBirth,
          gender: dto.gender,
          address: dto.address,
          phone: dto.phone,
          specialization: dto.specialization,
          hireDate: new Date(dto.hireDate),
        },
        include: {
          user: true,
        },
      });

      return teacher;
    });

    return new TeacherResponseDto(result);
  }

  /**
   * Register Parent
   */
  private async registerParent(
    dto: RegisterParentDto,
    hashedPassword: string,
  ) {
    // Check if NIK already exists
    const existingParent = await this.prisma.parent.findUnique({
      where: { nik: dto.nik },
    });

    if (existingParent) {
      throw new ConflictException('NIK sudah terdaftar');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: UserRole.PARENT,
          image: dto.image,
          emailVerified: false,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          access_token: hashedPassword,
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          nik: dto.nik,
          occupation: dto.occupation,
          phone: dto.phone,
          address: dto.address,
        },
        include: {
          user: true,
        },
      });

      return parent;
    });

    return new ParentResponseDto(result);
  }

  /**
   * Register Admin
   */
  private async registerAdmin(dto: RegisterAdminDto, hashedPassword: string) {
    // Check if NIP already exists (if provided)
    if (dto.nip) {
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { nip: dto.nip },
      });

      if (existingAdmin) {
        throw new ConflictException('NIP sudah terdaftar');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: UserRole.ADMIN,
          image: dto.image,
          emailVerified: false,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          access_token: hashedPassword,
        },
      });

      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          nip: dto.nip,
          position: dto.position,
          phone: dto.phone,
        },
        include: {
          user: true,
        },
      });

      return admin;
    });

    return new AdminResponseDto(result);
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        accounts: true,
        student: {
          include: {
            major: true,
            class: true,
          },
        },
        teacher: true,
        parent: true,
        admin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Get password from account
    const account = user.accounts.find((acc) => acc.provider === 'credentials');
    if (!account || !account.access_token) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      dto.password,
      account.access_token,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Create session
    const session = await this.createSession(user.id);

    // Return user data based on role
    let userData: any;
    switch (user.role) {
      case UserRole.STUDENT:
        if (!user.student) {
          throw new UnauthorizedException('Data siswa tidak ditemukan');
        }
        userData = new StudentResponseDto(user.student);
        break;
      case UserRole.TEACHER:
        if (!user.teacher) {
          throw new UnauthorizedException('Data guru tidak ditemukan');
        }
        userData = new TeacherResponseDto(user.teacher);
        break;
      case UserRole.PARENT:
        if (!user.parent) {
          throw new UnauthorizedException('Data orang tua tidak ditemukan');
        }
        userData = new ParentResponseDto(user.parent);
        break;
      case UserRole.ADMIN:
        if (!user.admin) {
          throw new UnauthorizedException('Data admin tidak ditemukan');
        }
        userData = new AdminResponseDto(user.admin);
        break;
      default:
        userData = new UserResponseDto(user);
    }

    return new AuthResponseDto({
      user: userData,
      sessionToken: session.sessionToken,
      message: 'Login berhasil',
    });
  }

  /**
   * Create session for user
   */
  private async createSession(userId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return this.prisma.session.create({
      data: {
        userId,
        sessionToken: this.generateSessionToken(),
        expires: expiresAt,
      },
    });
  }

  /**
   * Generate random session token
   */
  private generateSessionToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Get user by session token
   */
  async getUserBySessionToken(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            student: {
              include: {
                major: true,
                class: true,
              },
            },
            teacher: true,
            parent: true,
            admin: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return session.user;
  }

  /**
   * Logout user
   */
  async logout(sessionToken: string): Promise<{ message: string }> {
    await this.prisma.session.delete({
      where: { sessionToken },
    });

    return { message: 'Logout berhasil' };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            major: true,
            class: true,
          },
        },
        teacher: true,
        parent: true,
        admin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    switch (user.role) {
      case UserRole.STUDENT:
        if (!user.student) {
          throw new NotFoundException('Data siswa tidak ditemukan');
        }
        return new StudentResponseDto(user.student);
      case UserRole.TEACHER:
        if (!user.teacher) {
          throw new NotFoundException('Data guru tidak ditemukan');
        }
        return new TeacherResponseDto(user.teacher);
      case UserRole.PARENT:
        if (!user.parent) {
          throw new NotFoundException('Data orang tua tidak ditemukan');
        }
        return new ParentResponseDto(user.parent);
      case UserRole.ADMIN:
        if (!user.admin) {
          throw new NotFoundException('Data admin tidak ditemukan');
        }
        return new AdminResponseDto(user.admin);
      default:
        return new UserResponseDto(user);
    }
  }
}
