type DiscordUser = {
  id: string;
};

export type IUsers = {
  username: string;
  password: string;
  tag: DiscordUser;
  type: number;
  age: number;
  from_about: string;
  you_about: string;
  status: number;
  user_id: string;
  partner: string;
  is_discord: boolean;
  server: string;
  friends: string;
  uuid: string;
  premium_uuid?: string;
};
