import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export type MonitoringType = 'mineserv' | 'hotmc' | 'mclike' | 'minecraftrating';
type HashAlgorithm = 'sha1' | 'sha256' | 'md5';

export interface NormalizedVoteData {
  username: string;
  timestamp: string;
  signature: string;
  monitoring: MonitoringType;
}

export interface VoteValidationDebugInfo {
  payloadKeys: string[];
  detectedFormat: 'mineserv' | 'minecraftrating' | 'hotmc_or_mclike' | 'unknown';
  missingFields?: string[];
  signatureLength?: number;
  signatureIsHex?: boolean;
  tokenConfigured?: {
    mineserv?: boolean;
    minecraftrating?: boolean;
    hotmc?: boolean;
    mclike?: boolean;
  };
  signatureChecks?: Array<{
    monitoring: MonitoringType;
    algorithm: HashAlgorithm;
    matched: boolean;
  }>;
}

export interface VoteValidationResult {
  ok: boolean;
  data?: NormalizedVoteData;
  error?: 'required_data_missing' | 'invalid_signature' | 'unknown_format';
  debug?: VoteValidationDebugInfo;
}

@Injectable()
export class VoteValidationService {
  validate(payload: Record<string, any>): VoteValidationResult {
    return this.validateInternal(payload, false);
  }

  validateWithDebug(payload: Record<string, any>): VoteValidationResult {
    return this.validateInternal(payload, true);
  }

  private validateInternal(payload: Record<string, any>, includeDebug: boolean): VoteValidationResult {
    const baseDebug: VoteValidationDebugInfo = {
      payloadKeys: this.getPayloadKeys(payload),
      detectedFormat: 'unknown',
    };

    if (this.looksLikeMineServ(payload)) {
      baseDebug.detectedFormat = 'mineserv';
      const requiredFields = ['project', 'username', 'timestamp', 'signature'];
      const missingFields = this.getMissingFields(payload, requiredFields);

      if (missingFields.length > 0) {
        return this.buildError('required_data_missing', includeDebug, {
          ...baseDebug,
          missingFields,
        });
      }

      const expected = crypto
        .createHash('sha256')
        .update(
          `${payload.project}.${process.env.SECRET_KEY_FOR_VOTE_MINESERV}.${payload.timestamp}.${payload.username}`,
        )
        .digest('hex');

      const signatureDebug = this.getSignatureDebug(String(payload.signature), expected);
      const matched = this.safeCompareHex(payload.signature, expected);

      if (!matched) {
        return this.buildError('invalid_signature', includeDebug, {
          ...baseDebug,
          ...signatureDebug,
          tokenConfigured: { mineserv: this.hasConfiguredToken(process.env.SECRET_KEY_FOR_VOTE_MINESERV) },
          signatureChecks: [{ monitoring: 'mineserv', algorithm: 'sha256', matched: false }],
        });
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
      baseDebug.detectedFormat = 'minecraftrating';
      const requiredFields = ['username', 'ip', 'timestamp', 'signature'];
      const missingFields = this.getMissingFields(payload, requiredFields);

      if (missingFields.length > 0) {
        return this.buildError('required_data_missing', includeDebug, {
          ...baseDebug,
          missingFields,
        });
      }

      const expected = crypto
        .createHash('sha1')
        .update(`${payload.username}${payload.timestamp}${process.env.SECRET_KEY_FOR_VOTE_MINECRAFTRATING}`)
        .digest('hex');

      const signatureDebug = this.getSignatureDebug(String(payload.signature), expected);
      const matched = this.safeCompareHex(payload.signature, expected);

      if (!matched) {
        return this.buildError('invalid_signature', includeDebug, {
          ...baseDebug,
          ...signatureDebug,
          tokenConfigured: {
            minecraftrating: this.hasConfiguredToken(process.env.SECRET_KEY_FOR_VOTE_MINECRAFTRATING),
          },
          signatureChecks: [{ monitoring: 'minecraftrating', algorithm: 'sha1', matched: false }],
        });
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
      baseDebug.detectedFormat = 'hotmc_or_mclike';
      const username = payload.nick ?? payload.username;
      const timestamp = payload.time ?? payload.timestamp;
      const signature = payload.sign ?? payload.signature;

      const missingFields: string[] = [];
      if (!this.hasRequiredValues([username])) {
        missingFields.push('nick|username');
      }
      if (!this.hasRequiredValues([timestamp])) {
        missingFields.push('time|timestamp');
      }
      if (!this.hasRequiredValues([signature])) {
        missingFields.push('sign|signature');
      }

      if (missingFields.length > 0) {
        return this.buildError('required_data_missing', includeDebug, {
          ...baseDebug,
          missingFields,
        });
      }

      const signatureValue = String(signature);
      const hotmcChecks = this.createSignatureChecks(
        'hotmc',
        String(username),
        String(timestamp),
        signatureValue,
        process.env.SECRET_KEY_FOR_VOTE_HOTMC,
      );

      for (const check of hotmcChecks) {
        if (check.matched) {
          return {
            ok: true,
            data: {
              username: String(username),
              timestamp: String(timestamp),
              signature: signatureValue,
              monitoring: 'hotmc',
            },
          };
        }
      }

      const mclikeChecks = this.createSignatureChecks(
        'mclike',
        String(username),
        String(timestamp),
        signatureValue,
        process.env.SECRET_KEY_FOR_VOTE_MCLIKE,
      );

      for (const check of mclikeChecks) {
        if (check.matched) {
          return {
            ok: true,
            data: {
              username: String(username),
              timestamp: String(timestamp),
              signature: signatureValue,
              monitoring: 'mclike',
            },
          };
        }
      }

      const signatureDebug = this.getSignatureDebug(signatureValue, hotmcChecks[0].expected);
      return this.buildError('invalid_signature', includeDebug, {
        ...baseDebug,
        ...signatureDebug,
        tokenConfigured: {
          hotmc: this.hasConfiguredToken(process.env.SECRET_KEY_FOR_VOTE_HOTMC),
          mclike: this.hasConfiguredToken(process.env.SECRET_KEY_FOR_VOTE_MCLIKE),
        },
        signatureChecks: [...hotmcChecks, ...mclikeChecks].map((check) => ({
          monitoring: check.monitoring,
          algorithm: check.algorithm,
          matched: check.matched,
        })),
      });
    }

    return this.buildError('unknown_format', includeDebug, baseDebug);
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

  private getMissingFields(payload: Record<string, any>, keys: string[]): string[] {
    return keys.filter((key) => !this.hasRequiredValues([payload[key]]));
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

  private createSignatureChecks(
    monitoring: MonitoringType,
    username: string,
    timestamp: string,
    signature: string,
    token: string | undefined,
  ): Array<{
    monitoring: MonitoringType;
    algorithm: HashAlgorithm;
    expected: string;
    matched: boolean;
  }> {
    const algorithms: HashAlgorithm[] = ['sha1', 'md5'];
    return algorithms.map((algorithm) => {
      const expected = this.createHash(algorithm, `${username}${timestamp}${token}`);
      return {
        monitoring,
        algorithm,
        expected,
        matched: this.safeCompareHex(signature, expected),
      };
    });
  }

  private normalizeHex(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private createHash(algorithm: HashAlgorithm, input: string): string {
    return crypto.createHash(algorithm).update(input).digest('hex');
  }

  private getPayloadKeys(payload: Record<string, any>): string[] {
    return Object.keys(payload || {}).sort();
  }

  private hasConfiguredToken(token: string | undefined): boolean {
    return typeof token === 'string' && token.trim().length > 0;
  }

  private getSignatureDebug(signature: string, expected: string): Pick<VoteValidationDebugInfo, 'signatureLength' | 'signatureIsHex'> {
    const normalizedSignature = this.normalizeHex(signature);
    const normalizedExpected = this.normalizeHex(expected);
    return {
      signatureLength: normalizedSignature.length,
      signatureIsHex:
        normalizedSignature.length === normalizedExpected.length && this.isHex(normalizedSignature),
    };
  }

  private buildError(
    error: 'required_data_missing' | 'invalid_signature' | 'unknown_format',
    includeDebug: boolean,
    debug: VoteValidationDebugInfo,
  ): VoteValidationResult {
    if (!includeDebug) {
      return { ok: false, error };
    }

    return { ok: false, error, debug };
  }
}
