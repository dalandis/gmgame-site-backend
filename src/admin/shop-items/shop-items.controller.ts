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
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { RoleGuard } from '../../auth/roles/api-roles';
import { ShopItemsAdminService } from './shop-items.service';
import {
  shopItemCreateDto,
  shopItemDeleteDto,
  shopItemUpdateDto,
} from '../../validator/admin/shop-items-admin';

@Controller('/api/admin/shop_items')
export class ShopItemsAdminController {
  constructor(private readonly shopItemsAdminService: ShopItemsAdminService) {}

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Get()
  async getItems(@Request() req, @Response() res): Promise<void> {
    const items = await this.shopItemsAdminService.getItems();

    res.send(JSON.stringify({ items }));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/create')
  async createItem(
    @Request() req,
    @Response() res,
    @Body() body: shopItemCreateDto,
  ): Promise<void> {
    const response = await this.shopItemsAdminService.createItem(body);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/update')
  async updateItem(
    @Request() req,
    @Response() res,
    @Body() body: shopItemUpdateDto,
  ): Promise<void> {
    const response = await this.shopItemsAdminService.updateItem(body);

    res.send(JSON.stringify(response));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/delete')
  async deleteItem(
    @Request() req,
    @Response() res,
    @Body() body: shopItemDeleteDto,
  ): Promise<void> {
    const response = await this.shopItemsAdminService.deleteItem(body);

    res.send(JSON.stringify(response));
  }
}
