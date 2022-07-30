import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import TokenRepository from '../repositories/token.repository';
import { authConfig } from '../../config/auth.config';
import { CreateRefreshTokenDto } from '../commons/dto/create-refresh-token.dto';
import { TokenEntity } from '../entity/token.entity';
import CryptoService from './crypto.service';
import ForbiddenException from '../commons/exceptions/http/forbidden.exception';

export default class TokenService {
  constructor(
    private tokenRepository: TokenRepository,
    private cryptoService: CryptoService,
  ) {}

  public generateJwtAccessToken(userId: number): string {
    const accessSecret: string = authConfig.secretAccess;
    const expiresIn: string = authConfig.expireInAccess;

    return jwt.sign({ id: userId }, accessSecret, {
      expiresIn,
    });
  }

  public async generateRefreshToken(userId: number): Promise<string> {
    const refreshToken: string = uuidv4();

    const refreshTokenData: any = {
      user_id: userId,
      refresh_token: refreshToken,
      expires_in: authConfig.expireInRefresh,
    };

    const tokenEntity: TokenEntity = await this.CreateOrUpdateRefreshToken(
      refreshTokenData,
    );

    return this.cryptoService.encrypt(
      tokenEntity.refresh_token,
      authConfig.secretRefresh,
      authConfig.ivRefresh,
    );
  }

  public async CreateOrUpdateRefreshToken(tokenData: CreateRefreshTokenDto) {
    let refreshToken: TokenEntity = await this.tokenRepository.findOne({
      user_id: tokenData.user_id,
    });

    if (refreshToken) {
      refreshToken = await this.tokenRepository.update(
        refreshToken.id,
        tokenData,
      );
      return refreshToken;
    }

    refreshToken = await this.tokenRepository.create(tokenData);

    return refreshToken;
  }

  public async deleteRefreshToken(cryptoRefreshToken: string) {
    const decryptRefreshToken: string = this.cryptoService.decrypt(
      cryptoRefreshToken,
      authConfig.secretRefresh,
      authConfig.ivRefresh,
    );

    return await this.tokenRepository.delete({
      refresh_token: decryptRefreshToken,
    });
  }

  public async validRefreshToken(cryptoRefreshToken: string) {
    const decryptRefreshToken: string = this.cryptoService.decrypt(
      cryptoRefreshToken,
      authConfig.secretRefresh,
      authConfig.ivRefresh,
    );

    const refreshTokens: TokenEntity = await this.tokenRepository.findOne({
      refresh_token: decryptRefreshToken,
    });

    if (!refreshTokens || refreshTokens.expires_in <= new Date()) {
      throw new ForbiddenException('Unauthorized.');
    }

    const accessToken = this.generateJwtAccessToken(refreshTokens.user_id);

    const refreshTokenData: any = {
      user_id: refreshTokens.user_id,
      refresh_token: uuidv4(),
      expires_in: authConfig.expireInRefresh,
    };

    const tokenEntity: TokenEntity = await this.tokenRepository.update(
      refreshTokens.id,
      refreshTokenData,
    );
    const refreshToken = this.cryptoService.encrypt(
      tokenEntity.refresh_token,
      authConfig.secretRefresh,
      authConfig.ivRefresh,
    );

    return { accessToken, refreshToken };
  }
}
