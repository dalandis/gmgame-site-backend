import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const ADMIN_QUEUE_NAMES = ['users', 'cron-tasks', 'markers', 'citizenship'] as const;
export const ADMIN_QUEUE_JOB_STATUSES = [
  'all',
  'active',
  'waiting',
  'completed',
  'failed',
  'delayed',
  'paused',
] as const;

export type AdminQueueName = (typeof ADMIN_QUEUE_NAMES)[number];
export type AdminQueueJobStatus = (typeof ADMIN_QUEUE_JOB_STATUSES)[number];

export class queueJobsQueryDto {
  @IsOptional()
  @IsIn(ADMIN_QUEUE_JOB_STATUSES)
  status?: AdminQueueJobStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class queueCleanDto {
  @IsIn(['wait', 'active', 'completed', 'failed', 'delayed'])
  status: 'wait' | 'active' | 'completed' | 'failed' | 'delayed';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  graceMs?: number;
}

export class queueJobParamsDto {
  @IsString()
  jobId: string;
}
