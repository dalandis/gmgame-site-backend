import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RoleGuard } from '../auth/roles/api-roles';
import { shopBuyDto } from '../validator/shop';
import { ShopService } from './shop.service';

@Controller('/api/shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Get('/items')
  async getItems(@Request() req, @Response() res): Promise<void> {
    const response = await this.shopService.getItems(req.user.id);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/buy')
  async buyItem(@Request() req, @Response() res, @Body() body: shopBuyDto): Promise<void> {
    const response = await this.shopService.buyItem(req.user.id, body.itemId);

    res.send(JSON.stringify(response));
  }
}
