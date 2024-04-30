import {
  Controller,
  Get,
  UseGuards,
  Request,
  Response,
  Param,
  Post,
  Body,
  SetMetadata,
} from '@nestjs/common';
import { MarkersService } from './markers.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { markersDto } from '../validator/save_edit.markers';
import { UtilsService } from '../Utils/utils.service';
import { RoleGuard } from '../auth/roles/api-roles';
import { ParseIntPipe } from '../validator/number-params';

@Controller('/api')
export class MarkersController {
  constructor(
    private readonly markersService: MarkersService,
    private readonly utilsService: UtilsService,
  ) {}

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Get('/get_markers')
  async getMarkers(@Request() req, @Response() res): Promise<any> {
    const markers = await this.markersService.getMarkers(req.user.id);

    res.send({
      count: markers.length,
      markers: markers,
    });
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Get('/get_marker/:id_marker')
  async getMarker(
    @Request() req,
    @Response() res,
    @Param(new ParseIntPipe()) params,
  ): Promise<any> {
    if (params.id_marker === 'new') {
      return res.send({});
    }

    res.send(await this.markersService.getMarker(req.user.id, params.id_marker));
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/edit_marker')
  async editMarker(@Request() req, @Body() body: markersDto, @Response() res): Promise<any> {
    const message = await this.markersService.editMarker(body, req.user.id, req.user);

    res.send(JSON.stringify(message));
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('add_marker')
  async addMarker(@Request() req, @Body() body: markersDto, @Response() res): Promise<any> {
    const message = await this.markersService.addMarker(body, req.user.id, req.user);

    res.send(JSON.stringify(message));
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('delete_marker')
  async deleteMarker(@Request() req, @Body() body: markersDto, @Response() res): Promise<any> {
    const message = await this.markersService.deleteMarker(body, req.user.id, req.user);

    res.send(JSON.stringify(message));
  }
}
