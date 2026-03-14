import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { RoleGuard } from '../../auth/roles/api-roles';
import {
  queueCleanDto,
  queueJobsQueryDto,
  queueJobParamsDto,
} from '../../validator/admin/queues-admin';
import { AdminQueuesService } from './queues.service';

@Controller('/api/admin/queues')
@SetMetadata('role', 'admin')
@UseGuards(AuthenticatedGuard, RoleGuard)
export class AdminQueuesController {
  constructor(private readonly adminQueuesService: AdminQueuesService) {}

  @Get()
  async getQueues(): Promise<any> {
    return {
      queues: await this.adminQueuesService.getQueuesOverview(),
    };
  }

  @Get(':queueName/jobs')
  async getQueueJobs(@Param('queueName') queueName: string, @Query() query: queueJobsQueryDto): Promise<any> {
    return this.adminQueuesService.getQueueJobs(
      queueName,
      query.status ?? 'all',
      query.offset ?? 0,
      query.limit ?? 20,
    );
  }

  @Get(':queueName/jobs/:jobId')
  async getQueueJob(
    @Param('queueName') queueName: string,
    @Param() params: queueJobParamsDto,
  ): Promise<any> {
    return {
      job: await this.adminQueuesService.getJobDetails(queueName, params.jobId),
    };
  }

  @Post(':queueName/pause')
  async pauseQueue(@Param('queueName') queueName: string): Promise<any> {
    return this.adminQueuesService.pauseQueue(queueName);
  }

  @Post(':queueName/resume')
  async resumeQueue(@Param('queueName') queueName: string): Promise<any> {
    return this.adminQueuesService.resumeQueue(queueName);
  }

  @Post(':queueName/clean')
  async cleanQueue(@Param('queueName') queueName: string, @Body() body: queueCleanDto): Promise<any> {
    return this.adminQueuesService.cleanQueue(queueName, body.status, body.graceMs ?? 0);
  }

  @Post(':queueName/jobs/:jobId/retry')
  async retryJob(
    @Param('queueName') queueName: string,
    @Param() params: queueJobParamsDto,
  ): Promise<any> {
    return this.adminQueuesService.retryJob(queueName, params.jobId);
  }

  @Post(':queueName/jobs/:jobId/promote')
  async promoteJob(
    @Param('queueName') queueName: string,
    @Param() params: queueJobParamsDto,
  ): Promise<any> {
    return this.adminQueuesService.promoteJob(queueName, params.jobId);
  }

  @Post(':queueName/jobs/:jobId/remove')
  async removeJob(
    @Param('queueName') queueName: string,
    @Param() params: queueJobParamsDto,
  ): Promise<any> {
    return this.adminQueuesService.removeJob(queueName, params.jobId);
  }
}
