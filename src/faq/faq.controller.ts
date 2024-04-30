import {
  Controller,
  Get,
  UseGuards,
  Request,
  Response,
  Post,
  Body,
  SetMetadata,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { saveFaqDto } from '../validator/faq';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/save_faq')
  async saveFaq(@Request() req, @Response() res, @Body() body: saveFaqDto): Promise<any> {
    const message = await this.faqService.saveFaq(body);

    res.send(JSON.stringify(message));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Get('/get_mentions')
  async getMentions(@Request() req, @Response() res): Promise<any> {
    const mentions = await this.faqService.getMentions();

    res.send(JSON.stringify(mentions));
  }

  @Get('/get_faq')
  async getFaq(@Request() req, @Response() res): Promise<any> {
    const faq = await this.faqService.getFaq();

    res.send(JSON.stringify(faq));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/publish_faq')
  async publishFaq(@Request() req, @Response() res): Promise<any> {
    const faq = await this.faqService.publishFaq();

    res.send(JSON.stringify(faq));
  }
}
