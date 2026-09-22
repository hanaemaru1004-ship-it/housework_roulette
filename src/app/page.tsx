import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// "/" はセッション有無に応じてホーム or ログイン画面へ振り分けるだけの入口。
export default async function RootPage() {
  const session = await auth();
  redirect(session ? "/home" : "/login");
}
