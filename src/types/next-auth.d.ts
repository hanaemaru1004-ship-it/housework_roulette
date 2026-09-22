import type { DefaultSession } from "next-auth";

// next-authのSessionにユーザーIDを持たせるための型拡張。
// Server Actionsやページ側でDBクエリのuserIdスコープに利用する。
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
