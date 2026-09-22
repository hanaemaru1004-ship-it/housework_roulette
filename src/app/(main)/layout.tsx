import { BottomNav } from "@/components/layout/BottomNav";

// ホーム・ルーレット・家事リスト・履歴で共通の下部ナビゲーション付きレイアウト。
// 認証チェック自体はmiddleware.tsで行っている。
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
