import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Title should not be empty' })
  title!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString(
    {},
    { message: 'due_date must be a valid ISO 8601 date string' },
  )
  @IsNotEmpty({ message: 'Due date should not be empty' })
  due_date!: string;

  @ApiProperty()
  @IsUUID('4', { message: 'status_id must be a valid UUID' })
  @IsNotEmpty({ message: 'Status ID should not be empty' })
  status_id!: string;

  @ApiProperty()
  @IsArray({ message: 'assignee_ids must be an array' })
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  @IsOptional()
  assignee_ids?: string[];
}
