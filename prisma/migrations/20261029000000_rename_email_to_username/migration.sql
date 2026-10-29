-- メールアドレスをユーザー名に置き換える（既存の値はそのままユーザー名として引き継ぐ）
ALTER TABLE "User" RENAME COLUMN "email" TO "username";
ALTER INDEX "User_email_key" RENAME TO "User_username_key";
