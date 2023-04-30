export function getSecond(time) {
    const timeValue = time.split(":");
    const [hour, min, sec] = timeValue;
    return hour * 60 * 60 + min * 60 + sec * 1;
}

export function toggleToTime(seconds) {
    let sec = parseInt((seconds % 60) % 60);
    let min = parseInt((seconds / 60) % 60);
    let hour = parseInt(seconds / 60 / 60);
    sec = sec < 10 ? `0${sec}` : sec;
    min = min < 10 ? `0${min}` : min;
    hour = hour < 10 ? `0${hour}` : hour;
    return `${hour}:${min}:${sec}`;
}