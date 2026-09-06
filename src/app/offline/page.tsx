import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col gap-4 py-12 text-center">
      <h1 className="text-xl font-semibold">오프라인입니다</h1>
      <p className="text-sm text-muted-foreground">
        인터넷 연결을 확인한 뒤 다시 시도해 주세요.
      </p>
      <p className="text-sm text-muted-foreground">
        이미 열어둔 화면과 저장된 교대 데이터는 계속 사용할 수 있습니다.
      </p>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
