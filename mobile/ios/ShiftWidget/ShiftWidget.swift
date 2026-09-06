import WidgetKit
import SwiftUI

struct ShiftWidgetEntry: TimelineEntry {
    let date: Date
    let data: WidgetShiftData
}

struct ShiftWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> ShiftWidgetEntry {
        ShiftWidgetEntry(date: Date(), data: ShiftWidgetStore.placeholder())
    }

    func getSnapshot(in context: Context, completion: @escaping (ShiftWidgetEntry) -> Void) {
        let data = ShiftWidgetStore.load() ?? ShiftWidgetStore.placeholder()
        completion(ShiftWidgetEntry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ShiftWidgetEntry>) -> Void) {
        let data = ShiftWidgetStore.load() ?? ShiftWidgetStore.placeholder()
        let entry = ShiftWidgetEntry(date: Date(), data: data)
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

struct ShiftWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: ShiftWidgetProvider.Entry

    var body: some View {
        switch family {
        case .systemSmall:
            smallView
        case .systemMedium:
            mediumView
        default:
            largeView
        }
    }

    private var smallView: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("SHIFT")
                .font(.caption2)
                .foregroundStyle(.secondary)
            Spacer(minLength: 0)
            Text(entry.data.shift.isOff ? "휴무" : entry.data.shift.code)
                .font(.system(size: 34, weight: .bold, design: .rounded))
            Text(entry.data.shift.isOff ? entry.data.shift.cycleLabel : (entry.data.shift.workRange ?? "-"))
                .font(.footnote.weight(.semibold))
            if !entry.data.shift.isOff {
                Text(entry.data.shift.cycleLabel)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(12)
    }

    private var mediumView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.data.shift.cycleLabel)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("근무")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(entry.data.shift.isOff ? "휴무" : (entry.data.shift.workRange ?? "-"))
                        .font(.title3.bold())
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("꿀잠")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(entry.data.sleep.rangeCompact)
                        .font(.title3.bold())
                    Text("\(entry.data.sleep.durationHours)시간")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            if let nextOff = entry.data.nextOff {
                Text("다음 휴무 D-\(nextOff.daysUntil)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(14)
    }

    private var largeView: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(entry.data.shift.cycleLabel)
                .font(.headline)
            Text(entry.data.shift.isOff ? "휴무" : "근무 \(entry.data.shift.workRange ?? "-")")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("취침 \(entry.data.sleep.rangeCompact) · \(entry.data.sleep.durationHours)시간")
                .font(.title3.bold())
            HStack(spacing: 10) {
                statCard(
                    title: "다음 휴무",
                    value: entry.data.nextOff.map { "D-\($0.daysUntil)" } ?? "-"
                )
                statCard(
                    title: "다음 근무",
                    value: entry.data.nextWork?.name ?? "-"
                )
            }
            Spacer(minLength: 0)
            Text("SHIFT")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
    }

    private func statCard(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(.quaternary.opacity(0.35), in: RoundedRectangle(cornerRadius: 12))
    }
}

struct ShiftWidget: Widget {
    let kind: String = "ShiftWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ShiftWidgetProvider()) { entry in
            ShiftWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("SHIFT")
        .description("오늘 근무와 꿀잠 시간을 확인합니다.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
