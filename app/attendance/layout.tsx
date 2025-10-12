import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Presentifi - Mark Attendance",
    description: "Mark your attendance",
    viewport: "width=device-width, initial-scale=1",
}

export default function AttendanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
            {children}
        </div>
    );
}
