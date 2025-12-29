function canModifyReservation(date, timeSlot) {
  const [startTime] = timeSlot.split("-");
  const reservationDateTime = new Date(`${date}T${startTime}:00`);

  const now = new Date();
  const diffMs = reservationDateTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= 3;
}

module.exports = canModifyReservation;
