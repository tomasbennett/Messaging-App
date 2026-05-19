export function formatSentAtDate(date: Date | string): string {
    const sentDate = new Date(date);
    const now = new Date();

    const isToday =
        sentDate.getDate() === now.getDate() &&
        sentDate.getMonth() === now.getMonth() &&
        sentDate.getFullYear() === now.getFullYear();

    if (isToday) {
        return sentDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const startOfWeek = new Date(now);
    const day = now.getDay();

    const daysSinceMonday = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const isThisWeek = sentDate >= startOfWeek;

    if (isThisWeek) {
        return sentDate.toLocaleDateString("en-GB", {
            weekday: "long",
        });
    }

    return sentDate.toLocaleDateString("en-GB");
}