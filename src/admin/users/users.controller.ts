import { Controller, UseGuards, Request, Response, Post, Body, SetMetadata } from '@nestjs/common';
import { UserAdminService } from './users.service';
import {
  getUserDto,
  actionUserDto,
  markersDto,
  logsDto,
  markersUpdateDto,
  terrUpdateDto,
  updateUserDto,
  regenActionDto,
} from '../../validator/admin/users-admin';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { RoleGuard } from '../../auth/roles/api-roles';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('/api/admin')
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_user')
  async getUser(@Request() req, @Response() res, @Body() body: getUserDto): Promise<string> {
    const response = await this.userAdminService.getUser(body);

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет такого пользователя' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_markers')
  async getMarkers(@Request() req, @Response() res): Promise<string> {
    const response = await this.userAdminService.getMarkers();

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет меток' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_territories')
  async getTerritories(@Request() req, @Response() res): Promise<string> {
    const response = await this.userAdminService.getTerritories();

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет меток' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/action_user')
  async actionUser(@Request() req, @Response() res, @Body() body: actionUserDto): Promise<void> {
    const response = await this.userAdminService.actionUser(body, req.user);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/delete_marker')
  async deleteMarker(@Request() req, @Response() res, @Body() body: markersDto): Promise<void> {
    const response = await this.userAdminService.deleteMarker(body.id, req.user);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/update_marker')
  async updateMarker(
    @Request() req,
    @Response() res,
    @Body() body: markersUpdateDto,
  ): Promise<void> {
    const response = await this.userAdminService.updateMarker(body, req.user);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_logs')
  async getLogs(@Request() req, @Response() res, @Body() body: logsDto): Promise<string> {
    const response = await this.userAdminService.getLogs(body.id);

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет логов' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/update_territory')
  async updateTerritory(
    @Request() req,
    @Response() res,
    @Body() body: terrUpdateDto,
  ): Promise<void> {
    const response = await this.userAdminService.updateTerritory(body, req.user);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/delete_territory')
  async deleteTerritory(@Request() req, @Response() res, @Body() body: markersDto): Promise<void> {
    const response = await this.userAdminService.deleteTerritory(body.id, req.user);

    res.send(JSON.stringify(response));
  }

  // get_regens
  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_regens')
  async getRegens(@Request() req, @Response() res): Promise<string> {
    const response = await this.userAdminService.getRegens();

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет регенов' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  //update_user
  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/update_user')
  async updateUser(@Request() req, @Response() res, @Body() body: updateUserDto): Promise<void> {
    const response = await this.userAdminService.updateUser(body, req.user);

    res.send(JSON.stringify(response));
  }

  //regen_action
  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/regen_action')
  async regenAction(@Request() req, @Response() res, @Body() body: regenActionDto): Promise<void> {
    const response = await this.userAdminService.regenAction(body, req.user);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_whitelist')
  async getWhitelist(@Request() req, @Response() res): Promise<string> {
    const response = await this.userAdminService.getWhitelist();

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет вайтлиста' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_link')
  async getTicket(
    @Request() req,
    @Response() res,
    @Body() body: { name: string },
  ): Promise<string> {
    const response = await this.userAdminService.getLink(body.name);

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет тикета' }));
      return;
    }

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/get_tickets')
  async getTickets(@Request() req, @Response() res): Promise<string> {
    const response = await this.userAdminService.getTickets();

    if (!response) {
      res.send(JSON.stringify({ error: 'Нет тикетов' }));
      return;
    }

    res.send(JSON.stringify(response));
  }
}
