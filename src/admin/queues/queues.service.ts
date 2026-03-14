import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Job, Queue } from 'bull';
import {
  ADMIN_QUEUE_NAMES,
  AdminQueueJobStatus,
  AdminQueueName,
} from '../../validator/admin/queues-admin';

type BullBoardQueueName = AdminQueueName;
type BullStatus = Exclude<AdminQueueJobStatus, 'all'>;
type BullCleanStatus = 'wait' | 'active' | 'completed' | 'failed' | 'delayed';

const DEBUG_BULL_BOARD_PATH = '/_debug/queues';

interface QueueCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

@Injectable()
export class AdminQueuesService {
  private readonly serverAdapter: ExpressAdapter;
  private readonly adapters: Record<BullBoardQueueName, BullAdapter>;

  constructor(
    @InjectQueue('users') private readonly usersQueue: Queue,
    @InjectQueue('cron-tasks') private readonly cronTasksQueue: Queue,
    @InjectQueue('markers') private readonly markersQueue: Queue,
    @InjectQueue('citizenship') private readonly citizenshipQueue: Queue,
  ) {
    this.adapters = {
      users: new BullAdapter(this.usersQueue, { description: 'Пользовательские операции' }),
      'cron-tasks': new BullAdapter(this.cronTasksQueue, { description: 'Плановые фоновые задачи' }),
      markers: new BullAdapter(this.markersQueue, { description: 'Очередь обработки markers' }),
      citizenship: new BullAdapter(this.citizenshipQueue, { description: 'Проверка citizenship' }),
    };

    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath(DEBUG_BULL_BOARD_PATH);

    createBullBoard({
      queues: Object.values(this.adapters),
      serverAdapter: this.serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'GMGame Queues Debug',
        },
      },
    });
  }

  getDebugBullBoardPath(): string {
    return DEBUG_BULL_BOARD_PATH;
  }

  getDebugBullBoardRouter() {
    return this.serverAdapter.getRouter();
  }

  async getQueuesOverview() {
    return Promise.all(
      ADMIN_QUEUE_NAMES.map(async (queueName) => {
        const adapter = this.getAdapter(queueName);
        const counts = this.normalizeCounts(await adapter.getJobCounts());
        const paused = await adapter.isPaused();

        return {
          name: queueName,
          description: adapter.getDescription(),
          paused,
          counts,
          totalJobs:
            counts.waiting +
            counts.active +
            counts.completed +
            counts.failed +
            counts.delayed +
            counts.paused,
        };
      }),
    );
  }

  async getQueueJobs(queueName: string, status: AdminQueueJobStatus = 'all', offset = 0, limit = 20) {
    const adapter = this.getAdapter(queueName);
    const statuses = this.mapStatuses(status);
    const jobs = await adapter.getJobs(statuses, offset, offset + limit - 1);

    return {
      queue: queueName,
      status,
      offset,
      limit,
      items: await Promise.all(jobs.map((job) => this.serializeJobSummary(job))),
    };
  }

  async getJobDetails(queueName: string, jobId: string) {
    const adapter = this.getAdapter(queueName);
    const job = await adapter.getJob(jobId);

    if (!job) {
      throw new NotFoundException('Job не найден');
    }

    return this.serializeJobDetails(adapter, job);
  }

  async pauseQueue(queueName: string) {
    const adapter = this.getAdapter(queueName);
    await adapter.pause();
    return {
      message: `Очередь ${queueName} поставлена на паузу`,
      queue: await this.getQueueSnapshot(queueName),
    };
  }

  async resumeQueue(queueName: string) {
    const adapter = this.getAdapter(queueName);
    await adapter.resume();
    return {
      message: `Очередь ${queueName} возобновлена`,
      queue: await this.getQueueSnapshot(queueName),
    };
  }

  async retryJob(queueName: string, jobId: string) {
    const job = await this.getExistingJob(queueName, jobId);
    const state = await job.getState();

    if (state !== 'failed') {
      throw new BadRequestException('Retry доступен только для failed job');
    }

    await job.retry();

    return {
      message: `Job ${jobId} отправлен на retry`,
      job: await this.serializeJobDetails(this.getAdapter(queueName), job),
    };
  }

  async promoteJob(queueName: string, jobId: string) {
    const job = await this.getExistingJob(queueName, jobId);
    const state = await job.getState();

    if (state !== 'delayed') {
      throw new BadRequestException('Promote доступен только для delayed job');
    }

    await job.promote();

    return {
      message: `Job ${jobId} переведён в ожидание выполнения`,
      job: await this.serializeJobDetails(this.getAdapter(queueName), job),
    };
  }

  async removeJob(queueName: string, jobId: string) {
    const job = await this.getExistingJob(queueName, jobId);
    const state = await job.getState();

    if (state === 'active') {
      throw new BadRequestException('Нельзя удалить active job');
    }

    await job.remove();

    return {
      message: `Job ${jobId} удалён из очереди`,
    };
  }

  async cleanQueue(queueName: string, status: BullCleanStatus, graceMs = 0) {
    const adapter = this.getAdapter(queueName);
    await adapter.clean(status, graceMs);

    return {
      message: `Очередь ${queueName} очищена по статусу ${status}`,
      queue: await this.getQueueSnapshot(queueName),
    };
  }

  private getAdapter(queueName: string): BullAdapter {
    if (!ADMIN_QUEUE_NAMES.includes(queueName as AdminQueueName)) {
      throw new NotFoundException('Очередь не найдена');
    }

    return this.adapters[queueName as BullBoardQueueName];
  }

  private async getExistingJob(queueName: string, jobId: string): Promise<Job> {
    const job = await this.getAdapter(queueName).getJob(jobId);

    if (!job) {
      throw new NotFoundException('Job не найден');
    }

    return job as Job;
  }

  private async getQueueSnapshot(queueName: string) {
    const adapter = this.getAdapter(queueName);
    const counts = this.normalizeCounts(await adapter.getJobCounts());

    return {
      name: queueName,
      description: adapter.getDescription(),
      paused: await adapter.isPaused(),
      counts,
      totalJobs:
        counts.waiting +
        counts.active +
        counts.completed +
        counts.failed +
        counts.delayed +
        counts.paused,
    };
  }

  private mapStatuses(status: AdminQueueJobStatus): BullStatus[] {
    if (status === 'all') {
      return ['waiting', 'active', 'delayed', 'failed', 'completed', 'paused'];
    }

    return [status];
  }

  private normalizeCounts(counts: Record<string, number>): QueueCounts {
    return {
      waiting: counts.waiting ?? counts.wait ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
      paused: counts.paused ?? 0,
    };
  }

  private async serializeJobSummary(job: Job) {
    const state = await job.getState();

    return {
      id: String(job.id),
      name: job.name,
      state,
      timestamp: job.timestamp ?? null,
      processedOn: job.processedOn ?? null,
      finishedOn: job.finishedOn ?? null,
      delay: job.opts?.delay ?? 0,
      attemptsMade: job.attemptsMade ?? 0,
      attempts: job.opts?.attempts ?? null,
      progress: this.serializeValue(job.progress()),
      failedReason: job.failedReason ?? null,
      dataPreview: this.serializePreview(job.data),
    };
  }

  private async serializeJobDetails(adapter: BullAdapter, job: Job) {
    const state = await job.getState();
    const logs = await adapter.getJobLogs(String(job.id));

    return {
      id: String(job.id),
      queue: job.queue.name,
      name: job.name,
      state,
      timestamp: job.timestamp ?? null,
      processedOn: job.processedOn ?? null,
      finishedOn: job.finishedOn ?? null,
      delay: job.opts?.delay ?? 0,
      attemptsMade: job.attemptsMade ?? 0,
      attempts: job.opts?.attempts ?? null,
      failedReason: job.failedReason ?? null,
      stacktrace: Array.isArray(job.stacktrace) ? job.stacktrace : [],
      progress: this.serializeValue(job.progress()),
      data: this.serializeValue(job.data),
      opts: this.serializeValue(job.opts ?? {}),
      returnValue: this.serializeValue((job as unknown as { returnvalue?: unknown }).returnvalue),
      logs,
    };
  }

  private serializePreview(value: unknown): string {
    if (value === undefined) {
      return 'undefined';
    }

    if (value === null) {
      return 'null';
    }

    if (typeof value === 'string') {
      return value.length > 240 ? `${value.slice(0, 240)}...` : value;
    }

    try {
      const serialized = JSON.stringify(value);
      if (!serialized) {
        return String(value);
      }
      return serialized.length > 240 ? `${serialized.slice(0, 240)}...` : serialized;
    } catch {
      return String(value);
    }
  }

  private serializeValue(value: unknown): unknown {
    if (value === undefined || value === null) {
      return value ?? null;
    }

    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }
}
