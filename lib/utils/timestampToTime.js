export function timestampToTime(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.log("not a date");
    return "?";
  }
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
