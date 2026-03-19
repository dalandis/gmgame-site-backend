import { Controller, Get, Response } from '@nestjs/common';
import { ShopkeepersService } from './shopkeepers.service';

@Controller('/api/shopkeepers')
export class ShopkeepersController {
  constructor(private readonly shopkeepersService: ShopkeepersService) {}

  @Get()
  getAll(@Response() res): void {
    const data = this.shopkeepersService.parse();
    res.send(JSON.stringify(data));
  }
}
