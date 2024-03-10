import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tickets } from './tickets.model';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Tickets)
    private ticketsModel: typeof Tickets,
  ) {}

  async closeTicket(data): Promise<Tickets> {
    return this.ticketsModel.create({
      user_id: data.user_id,
      name: data.ticket_id,
    });
  }
}
