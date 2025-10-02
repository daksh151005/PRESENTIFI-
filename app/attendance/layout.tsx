'use client';

export default function AttendanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Render children without sidebar or other global layout elements
    return <>{children}</>;
}
