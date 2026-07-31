export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export type SubscribePushDtoBody = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
};
