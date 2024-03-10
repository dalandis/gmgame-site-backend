import {
  Controller,
  UseGuards,
  Request,
  Response,
  Post,
  Body,
  SetMetadata,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { LoginGuardBearer } from '../auth/guards/login.guard';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @SetMetadata('role', 'bot')
  @UseGuards(LoginGuardBearer, RoleGuard)
  @Post('/close_ticket')
  async closeTicket(
    @Request() req,
    @Response() res,
    @Body() body: { ticket_id: string; user_id: string },
  ): Promise<any> {
    const response = await this.ticketsService.closeTicket(body);

    res.send(JSON.stringify(response));
  }
}
