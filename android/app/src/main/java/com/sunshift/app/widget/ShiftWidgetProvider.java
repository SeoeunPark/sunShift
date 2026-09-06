package com.sunshift.app.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

import com.sunshift.app.R;

import org.json.JSONObject;

public class ShiftWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "group.com.sunshift.app";
    private static final String SNAPSHOT_KEY = "shift_widget_snapshot";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateWidget(
            Context context,
            AppWidgetManager appWidgetManager,
            int appWidgetId
    ) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.shift_widget);
        JSONObject snapshot = readSnapshot(context);

        if (snapshot != null) {
            JSONObject shift = snapshot.optJSONObject("shift");
            JSONObject sleep = snapshot.optJSONObject("sleep");
            JSONObject nextOff = snapshot.optJSONObject("nextOff");

            boolean isOff = shift != null && shift.optBoolean("isOff");
            String code = shift != null ? shift.optString("code", "-") : "-";
            String cycleLabel = shift != null ? shift.optString("cycleLabel", "SHIFT") : "SHIFT";
            String workRange = shift != null ? shift.optString("workRange", "-") : "-";
            String sleepRange = sleep != null ? sleep.optString("rangeCompact", "-") : "-";
            int sleepHours = sleep != null ? sleep.optInt("durationHours", 0) : 0;
            Integer daysUntilOff = nextOff != null ? nextOff.optInt("daysUntil") : null;

            views.setTextViewText(R.id.widget_title, "SHIFT");
            views.setTextViewText(R.id.widget_primary, isOff ? "휴무" : code);
            views.setTextViewText(R.id.widget_secondary, isOff ? cycleLabel : workRange);
            views.setTextViewText(
                    R.id.widget_tertiary,
                    "꿀잠 " + sleepRange + " · " + sleepHours + "시간"
            );
            views.setTextViewText(
                    R.id.widget_footer,
                    daysUntilOff != null ? "다음 휴무 D-" + daysUntilOff : cycleLabel
            );
        } else {
            views.setTextViewText(R.id.widget_title, "SHIFT");
            views.setTextViewText(R.id.widget_primary, "—");
            views.setTextViewText(R.id.widget_secondary, "앱을 열어 동기화하세요");
            views.setTextViewText(R.id.widget_tertiary, "");
            views.setTextViewText(R.id.widget_footer, "");
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static JSONObject readSnapshot(Context context) {
        try {
            String json = context
                    .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .getString(SNAPSHOT_KEY, null);
            if (json == null) {
                return null;
            }
            return new JSONObject(json);
        } catch (Exception ignored) {
            return null;
        }
    }
}
