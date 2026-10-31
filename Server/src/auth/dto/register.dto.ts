import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ description: 'Create a new organization (OWNER)' })
  @ValidateIf((o: RegisterDto) => !o.organizationSlug)
  @IsOptional()
  @IsString()
  @MinLength(2)
  organizationName?: string;

  @ApiPropertyOptional({ description: 'Join existing org by slug (LEARNER)' })
  @ValidateIf((o: RegisterDto) => !o.organizationName)
  @IsOptional()
  @IsString()
  @MinLength(2)
  organizationSlug?: string;
}
