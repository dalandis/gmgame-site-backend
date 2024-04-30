import { Injectable } from '@nestjs/common';
import { tickets } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prismaService: PrismaService) {}

  async closeTicket(data): Promise<tickets> {
    return this.prismaService.tickets.create({
      data: {
        user_id: data.user_id,
        name: data.ticket_id,
      },
    });
  }
}
