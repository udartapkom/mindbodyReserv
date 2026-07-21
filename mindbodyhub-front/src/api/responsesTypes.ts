import { User } from "@/types/user";

export type AuthTokensResponse = {
    accessToken: string;
    refreshToken: string;
    user: User;
  };

import type { Material } from "@/types/material";

export type Problem = Pick<
  Material,
  "id" | "title" | "slug" | "summary" | "coverUrl" | "tariffType" | "status"
>;