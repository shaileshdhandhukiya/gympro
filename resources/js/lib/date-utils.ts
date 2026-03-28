export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

export function formatTime(time: string): string {
    return time;
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString();
}

export function calculateTimeDifference(startTime: string, endTime: string): string {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diff = Math.abs(end.getTime() - start.getTime());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}
