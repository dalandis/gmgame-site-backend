import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export type MonitoringType = 'mineserv' | 'hotmc' | 'mclike' | 'minecraftrating';

export interface NormalizedVoteData {
  username: string;
  timestamp: string;
  signature: string;
  monitoring: MonitoringType;
}

export interface VoteValidationResult {
  ok: boolean;
  data?: NormalizedVoteData;
  error?: 'required_data_missing' | 'invalid_signature' | 'unknown_format';
}

@Injectable()
export class VoteValidationService {
  validate(payload: Record<string, any>): VoteValidationResult {
    if (this.looksLikeMineServ(payload)) {
      if (!this.hasRequired(payload, ['project', 'username', 'timestamp', 'signature'])) {
        return { ok: false, error: 'required_data_missing' };
      }

      const expected = crypto
        .createHash('sha256')
        .update(
          `${payload.project}.${process.env.SECRET_KEY_FOR_VOTE_MINESERV}.${payload.timestamp}.${payload.username}`,
        )
        .digest('hex');

      if (!this.safeCompareHex(payload.signature, expected)) {
        return { ok: false, error: 'invalid_signature' };
      }

      return {
        ok: true,
        data: {
          username: String(payload.username),
          timestamp: String(payload.timestamp),
          signature: String(payload.signature),
          monitoring: 'mineserv',
        },
      };
    }

    if (this.looksLikeMinecraftRating(payload)) {
      if (!this.hasRequired(payload, ['username', 'ip', 'timestamp', 'signature'])) {
        return { ok: false, error: 'required_data_missing' };
      }

      const expected = crypto
        .createHash('sha1')
        .update(`${payload.username}${payload.timestamp}${process.env.SECRET_KEY_FOR_VOTE_MINECRAFTRATING}`)
        .digest('hex');

      if (!this.safeCompareHex(payload.signature, expected)) {
        return { ok: false, error: 'invalid_signature' };
      }

      return {
        ok: true,
        data: {
          username: String(payload.username),
          timestamp: String(payload.timestamp),
          signature: String(payload.signature),
          monitoring: 'minecraftrating',
        },
      };
    }

    if (this.looksLikeHotMcOrMCLike(payload)) {
      const username = payload.nick ?? payload.username;
      const timestamp = payload.time ?? payload.timestamp;
      const signature = payload.sign ?? payload.signature;

      if (!this.hasRequiredValues([username, timestamp, signature])) {
        return { ok: false, error: 'required_data_missing' };
      }

      const hotmcExpected = crypto
        .createHash('sha1')
        .update(`${username}${timestamp}${process.env.SECRET_KEY_FOR_VOTE_HOTMC}`)
        .digest('hex');

      if (this.safeCompareHex(signature, hotmcExpected)) {
        return {
          ok: true,
          data: {
            username: String(username),
            timestamp: String(timestamp),
            signature: String(signature),
            monitoring: 'hotmc',
          },
        };
      }

      const mclikeExpected = crypto
        .createHash('sha1')
        .update(`${username}${timestamp}${process.env.SECRET_KEY_FOR_VOTE_MCLIKE}`)
        .digest('hex');

      if (this.safeCompareHex(signature, mclikeExpected)) {
        return {
          ok: true,
          data: {
            username: String(username),
            timestamp: String(timestamp),
            signature: String(signature),
            monitoring: 'mclike',
          },
        };
      }

      return { ok: false, error: 'invalid_signature' };
    }

    return { ok: false, error: 'unknown_format' };
  }

  private looksLikeMineServ(payload: Record<string, any>): boolean {
    return this.hasAnyKey(payload, ['project']);
  }

  private looksLikeMinecraftRating(payload: Record<string, any>): boolean {
    return this.hasAnyKey(payload, ['ip']);
  }

  private looksLikeHotMcOrMCLike(payload: Record<string, any>): boolean {
    if (this.hasAnyKey(payload, ['nick', 'time', 'sign'])) {
      return true;
    }

    if (this.hasAnyKey(payload, ['project', 'ip'])) {
      return false;
    }

    return this.hasAnyKey(payload, ['username', 'timestamp', 'signature']);
  }

  private hasAnyKey(payload: Record<string, any>, keys: string[]): boolean {
    return keys.some((key) => Object.prototype.hasOwnProperty.call(payload, key));
  }

  private hasRequired(payload: Record<string, any>, keys: string[]): boolean {
    return this.hasRequiredValues(keys.map((key) => payload[key]));
  }

  private hasRequiredValues(values: any[]): boolean {
    return values.every((value) => {
      if (value === undefined || value === null) {
        return false;
      }

      return String(value).trim().length > 0;
    });
  }

  private safeCompareHex(left: string, right: string): boolean {
    const normalizedLeft = String(left || '').trim().toLowerCase();
    const normalizedRight = String(right || '').trim().toLowerCase();

    if (!this.isHex(normalizedLeft) || !this.isHex(normalizedRight)) {
      return false;
    }

    if (normalizedLeft.length !== normalizedRight.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(normalizedLeft, 'hex'),
      Buffer.from(normalizedRight, 'hex'),
    );
  }

  private isHex(value: string): boolean {
    return value.length > 0 && value.length % 2 === 0 && /^[0-9a-f]+$/.test(value);
  }
}
