export function formatDateToDDMMMYYMMHH(isoString) {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    console.log("not a date");
  }

  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}

// Example usage:
// const inputDate = "2025-09-05T15:18:02.877Z";
// const formattedDate = formatDateToDDMMMYYMMHH(inputDate);
// console.log(formattedDate); // Output: "05 Sep 25 - 18:15"
