import type React from "react";
import { useState, useEffect } from "react";
import "./calender.scss";

interface CalendarProps {
  selectedDates: Date[];
  onSelectDates: (dates: Date[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDates,
  onSelectDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localSelectedDates, setLocalSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    setLocalSelectedDates(selectedDates);
  }, [selectedDates]);

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateSelected = (date: Date) => {
    return localSelectedDates.some(
      (selectedDate) =>
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate()
    );
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    const isSelected = isDateSelected(date);

    if (isSelected) {
      // Remove date if already selected
      setLocalSelectedDates(
        localSelectedDates.filter(
          (selectedDate) =>
            !(
              selectedDate.getFullYear() === date.getFullYear() &&
              selectedDate.getMonth() === date.getMonth() &&
              selectedDate.getDate() === date.getDate()
            )
        )
      );
    } else {
      // Add date if not selected
      setLocalSelectedDates([...localSelectedDates, date]);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleApply = () => {
    onSelectDates(localSelectedDates);
  };

  const monthData = getMonthData(currentMonth);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="month-nav" onClick={handlePrevMonth}>
          &lt;
        </button>
        <div className="current-month">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button type="button" className="month-nav" onClick={handleNextMonth}>
          &gt;
        </button>
      </div>

      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}

        {monthData.map((date, index) => (
          <div
            key={index}
            className={`calendar-day ${!date ? "empty" : ""} ${
              date && isDateSelected(date) ? "selected" : ""
            } ${date && isDateDisabled(date) ? "disabled" : ""}`}
            onClick={() => date && handleDateClick(date)}
          >
            {date ? date.getDate() : ""}
          </div>
        ))}
      </div>

      <div className="calendar-footer">
        <button type="button" className="apply-button" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default Calendar;
