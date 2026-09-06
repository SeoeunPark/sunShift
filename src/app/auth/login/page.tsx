import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <header>
        <h1 className="text-xl font-semibold">계정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          로그인하지 않아도 교대 계산과 로컬 사용이 가능합니다.
        </p>
      </header>
      <LoginForm />
    </div>
  );
}
