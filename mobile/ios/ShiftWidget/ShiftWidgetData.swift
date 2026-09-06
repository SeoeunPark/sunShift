import Foundation

struct WidgetShiftData: Codable {
    struct Shift: Codable {
        let code: String
        let name: String
        let cycleLabel: String
        let workRange: String?
        let isOff: Bool
    }

    struct Sleep: Codable {
        let label: String
        let rangeCompact: String
        let durationHours: Int
    }

    struct NextOff: Codable {
        let date: String
        let daysUntil: Int
    }

    struct NextWork: Codable {
        let date: String
        let code: String
        let name: String
    }

    let shift: Shift
    let sleep: Sleep
    let nextOff: NextOff?
    let nextWork: NextWork?
}

enum ShiftWidgetStore {
    static let appGroup = "group.com.sunshift.app"
    static let snapshotKey = "shift_widget_snapshot"

    static func load() -> WidgetShiftData? {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let json = defaults.string(forKey: snapshotKey),
            let data = json.data(using: .utf8)
        else {
            return nil
        }

        return try? JSONDecoder().decode(WidgetShiftData.self, from: data)
    }

    static func placeholder() -> WidgetShiftData {
        WidgetShiftData(
            shift: .init(code: "B", name: "B조", cycleLabel: "B조 5/6일차", workRange: "15 ~ 23", isOff: false),
            sleep: .init(label: "B조", rangeCompact: "01 ~ 08", durationHours: 7),
            nextOff: .init(date: "2026-09-09", daysUntil: 3),
            nextWork: .init(date: "2026-09-09", code: "A", name: "A조")
        )
    }
}
