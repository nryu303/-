// ============================================================
// 簡易セッション管理(デモ用)
//
// 本番実装では Supabase Auth のセッションに置き換わります。
// ここではブラウザの sessionStorage に保持するだけの簡易版です。
// (タブを閉じると破棄されます)
// ============================================================

const KEY_AUTH = "jq_demo_auth";

export const session = {
  /** ログイン済みか */
  isAuthed(): boolean {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(KEY_AUTH) === "1";
  },

  login(email: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(KEY_AUTH, "1");
    window.sessionStorage.setItem("jq_demo_email", email);
  },

  logout() {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(KEY_AUTH);
  },

  email(): string {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("jq_demo_email") ?? "admin@example.com";
  },
};
