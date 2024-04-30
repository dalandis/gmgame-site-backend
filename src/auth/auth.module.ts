import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './discord.strategy';
import { SessionSerializer } from './session.serializer';
import { BearerStrategy } from './bearer.strategy';
import { RoleGuard } from './roles/api-roles';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'discord', session: true }), PrismaModule],
  providers: [DiscordStrategy, SessionSerializer, BearerStrategy, RoleGuard],
})
export class AuthModule {}
