import { Controller, Request, Response, HttpStatus, Get } from '@nestjs/common';
import { ShopsService } from './shops.service'
@Controller('/api')
export class ShopsController {
    constructor(
        private readonly shopsService: ShopsService
    ) {}
    
    @Get('/get_shops')
    async getShops(@Request() req, @Response() res): Promise<any> {
        const response = await this.shopsService.getShops();

        res.send(response);
    }
}

