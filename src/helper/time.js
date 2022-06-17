const date = new Date("2022-06-15");
const month = String(date.getMonth() + 1).padStart(2, "0");
const year = date.getFullYear();
const day = String(date.getDate()).padStart(2, "0");
const dateFormat = (year + "-" + month + "-" + day).toString();
exports.startDate = dateFormat + "T00:00:00.000Z";
exports.endDate = dateFormat + "T23:59:59.000Z";
