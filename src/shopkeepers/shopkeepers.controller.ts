import { Body, Controller, Get, Post, Request, Response, UseGuards } from '@nestjs/common';
import { ShopkeepersService } from './shopkeepers.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('/api/shopkeepers')
export class ShopkeepersController {
  constructor(private readonly shopkeepersService: ShopkeepersService) {}

  @Get()
  getAll(@Response() res): void {
    const data = this.shopkeepersService.parse();
    res.send(JSON.stringify(data));
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/compass')
  async compass(@Request() req, @Response() res, @Body() body: { x: number; z: number }): Promise<void> {
    const result = await this.shopkeepersService.compass(req.user.id, body.x, body.z);
    res.send(JSON.stringify(result));
  }
}
