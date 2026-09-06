# SHIFT Mobile (iOS / Android Widgets)

Capacitor native shell + home screen widgets for iOS (WidgetKit) and Android (App Widget).

## Prerequisites

- Node.js 20+
- Xcode 16+ (iOS)
- Android Studio (Android)
- For local dev: `npm run dev` running (Capacitor loads the Next.js URL)

## 1. Install & sync

```bash
npm install
npm run mobile:sync
```

## 2. Run the web app inside native shell

Terminal A:

```bash
npm run dev
```

Terminal B:

```bash
export CAPACITOR_SERVER_URL=http://localhost:3000
npm run mobile:ios     # or mobile:android
```

Production builds should set `CAPACITOR_SERVER_URL` to your deployed HTTPS origin before `mobile:sync`.

## 3. iOS widget setup

1. Open `ios/App/App.xcworkspace` in Xcode.
2. **Signing & Capabilities** → add App Group: `group.com.sunshift.app` on **App** target.
3. File → New → Target → **Widget Extension** (name: `ShiftWidget`).
4. Add App Group `group.com.sunshift.app` on the **ShiftWidget** target too.
5. Replace generated Swift files with sources from `mobile/ios/ShiftWidget/`.
6. Build & run on device/simulator.
7. Long-press home screen → **+** → search **SHIFT** → add widget.

Data flow: the Capacitor app writes JSON to App Group (`shift_widget_snapshot`) via `capacitor-widget-bridge`, then reloads WidgetKit timelines.

## 4. Android widget setup

Android widget files are already wired in `android/`:

- `app/src/main/java/com/sunshift/app/widget/ShiftWidgetProvider.java`
- `app/src/main/res/layout/shift_widget.xml`
- `app/src/main/res/xml/shift_widget_info.xml`
- `AndroidManifest.xml` receiver entry

Steps:

1. Open `android/` in Android Studio → Run on device/emulator.
2. Long-press home screen → **Widgets** → **SHIFT**.
3. Open the app once so widget data syncs from your shift settings.

In-app: **설정 → Android 위젯 추가 요청** (Android 8+ pin support).

## Widget sizes

| Size | Content |
|------|---------|
| Small (iOS 2×2) | 조 / 근무 시간 / 일차 |
| Medium (iOS 4×2) | 근무 + 꿀잠 + 다음 휴무 |
| Large (iOS 4×4) | 근무, 수면, 다음 휴무·근무 카드 |
| Android | Resizable; shows primary + sleep + footer |

## API (web fallback / debugging)

`GET /api/widget/today` returns the same JSON shape used by native widgets (default shift settings).

## Shared constants

- App Group / SharedPreferences name: `group.com.sunshift.app`
- Snapshot key: `shift_widget_snapshot`
- Android provider: `com.sunshift.app.widget.ShiftWidgetProvider`
- iOS widget kind: `ShiftWidget`
