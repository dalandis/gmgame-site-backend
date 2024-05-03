import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  envFilePath: '.env.server-api',
});

@Injectable()
export class DataProviderService {
  public async sendDiscordWebHook(content: string, username: string): Promise<string> {
    return axios.request({
      data: {
        content: content,
        username: username,
        allowed_mentions: {
          parse: ['users'],
          users: [],
        },
      },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: this.getUrlWebhook(username),
    });
  }

  public async sendToServerApi<T>(payload: T, url: string, method: string): Promise<AxiosResponse> {
    return axios.request({
      data: JSON.stringify(payload),
      method: method,
      url: process.env.URL_FOR_SERVER_API + url,
      headers: {
        Authorization: 'Bearer ' + process.env.TOKEN_FOR_SERVER_API,
        'Content-type': 'application/json',
      },
    });
  }

  public async sendToServerApiNew<T>(
    payload: T,
    url: string,
    method: string,
  ): Promise<AxiosResponse> {
    return axios.request({
      data: JSON.stringify(payload),
      method: method,
      url: process.env.URL_FOR_SERVER_API_NEW + url,
      headers: {
        Authorization: 'Bearer ' + process.env.TOKEN_FOR_SERVER_API,
        'Content-type': 'application/json',
      },
    });
  }

  public async sendToBot<T>(payload: T, url: string, method: string): Promise<AxiosResponse> {
    const response = axios
      .request({
        data: JSON.stringify(payload),
        method: method,
        url: process.env.URL_FOR_BOT_API + url,
        headers: {
          Authorization: 'Bearer ' + process.env.TOKEN_FOR_BOT_API,
          'Content-type': 'application/json',
        },
      })
      .catch((error) => {
        console.log(error);
        return error;
      });

    return response;
  }

  private getUrlWebhook(username: string): string {
    switch (username) {
      case 'Yakubovich':
        return process.env.URL_WEBHOOK_FOR_REWARDS;
      case 'applicant':
        return process.env.URL_WEBHOOK_FOR_REG;
    }
  }
}
