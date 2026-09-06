package com.sunshift.app.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.sunshift.app.R
import org.json.JSONObject

class ShiftWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private const val PREFS_NAME = "group.com.sunshift.app"
        private const val SNAPSHOT_KEY = "shift_widget_snapshot"

        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val views = RemoteViews(context.packageName, R.layout.shift_widget)
            val snapshot = readSnapshot(context)

            if (snapshot != null) {
                val shift = snapshot.optJSONObject("shift")
                val sleep = snapshot.optJSONObject("sleep")
                val nextOff = snapshot.optJSONObject("nextOff")

                val isOff = shift?.optBoolean("isOff") ?: false
                val code = shift?.optString("code") ?: "-"
                val cycleLabel = shift?.optString("cycleLabel") ?: "SHIFT"
                val workRange = shift?.optString("workRange") ?: "-"
                val sleepRange = sleep?.optString("rangeCompact") ?: "-"
                val sleepHours = sleep?.optInt("durationHours") ?: 0
                val daysUntilOff = nextOff?.optInt("daysUntil")

                views.setTextViewText(R.id.widget_title, "SHIFT")
                views.setTextViewText(
                    R.id.widget_primary,
                    if (isOff) "휴무" else code,
                )
                views.setTextViewText(
                    R.id.widget_secondary,
                    if (isOff) cycleLabel else workRange,
                )
                views.setTextViewText(
                    R.id.widget_tertiary,
                    "꿀잠 $sleepRange · ${sleepHours}시간",
                )
                views.setTextViewText(
                    R.id.widget_footer,
                    daysUntilOff?.let { "다음 휴무 D-$it" } ?: cycleLabel,
                )
            } else {
                views.setTextViewText(R.id.widget_title, "SHIFT")
                views.setTextViewText(R.id.widget_primary, "—")
                views.setTextViewText(R.id.widget_secondary, "앱을 열어 동기화하세요")
                views.setTextViewText(R.id.widget_tertiary, "")
                views.setTextViewText(R.id.widget_footer, "")
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun readSnapshot(context: Context): JSONObject? {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val json = prefs.getString(SNAPSHOT_KEY, null) ?: return null
            return runCatching { JSONObject(json) }.getOrNull()
        }
    }
}
