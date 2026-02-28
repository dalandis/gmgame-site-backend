import * as crypto from 'crypto';
import { VoteValidationService } from './vote-validation.service';

describe('VoteValidationService', () => {
  let service: VoteValidationService;

  beforeEach(() => {
    process.env.SECRET_KEY_FOR_VOTE_MINESERV = 'mineserv-token';
    process.env.SECRET_KEY_FOR_VOTE_HOTMC = 'hotmc-token';
    process.env.SECRET_KEY_FOR_VOTE_MCLIKE = 'mclike-token';
    process.env.SECRET_KEY_FOR_VOTE_MINECRAFTRATING = 'rating-token';

    service = new VoteValidationService();
  });

  it('validates MineServ request and normalizes payload', () => {
    const payload = {
      project: 'gmgame',
      username: 'Steve',
      timestamp: '1700000000',
      signature: crypto
        .createHash('sha256')
        .update('gmgame.mineserv-token.1700000000.Steve')
        .digest('hex')
        .toUpperCase(),
    };

    const result = service.validate(payload);

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({
      username: 'Steve',
      timestamp: '1700000000',
      signature: payload.signature,
      monitoring: 'mineserv',
    });
  });

  it('returns required_data_missing when format is recognized but fields are incomplete', () => {
    const result = service.validate({ nick: 'Alex', time: '1700000010' });

    expect(result).toEqual({ ok: false, error: 'required_data_missing' });
  });

  it('returns invalid_signature when sign does not match monitoring token', () => {
    const result = service.validate({
      nick: 'Alex',
      time: '1700000010',
      sign: 'abcdef',
    });

    expect(result).toEqual({ ok: false, error: 'invalid_signature' });
  });

  it('returns unknown_format for non-supported payload', () => {
    const result = service.validate({ server: 'x', vote: 'y' });

    expect(result).toEqual({ ok: false, error: 'unknown_format' });
  });

  it('supports legacy username/timestamp/signature hotmc payload', () => {
    const payload = {
      username: 'Alex',
      timestamp: '1700000010',
      signature: crypto.createHash('sha1').update('Alex1700000010hotmc-token').digest('hex'),
    };

    const result = service.validate(payload);

    expect(result.ok).toBe(true);
    expect(result.data.monitoring).toBe('hotmc');
  });
});
