import React, { useState, useEffect, JSX } from 'react';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate = new Date(), 
  onDateSelect,
  className = ""
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Update current date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), ));
    }
  }, [selectedDate]);

  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDate(date, today);
  };

  const navigateMonth = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day: number): void => {
    const d = new Date();
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day,d.getHours(),d.getMinutes(),d.getSeconds());
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const renderCalendarDays = (): JSX.Element[] => { 
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: JSX.Element[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && isSameDate(date, selectedDate);
      const isTodayDate = isToday(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-colors duration-200
            hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${isSelected 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : isTodayDate 
                ? 'bg-blue-100 text-blue-800 font-semibold' 
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 w-80 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Previous month"
        >
          <ChevronArrow className="" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Next month"
        >
          <ChevronArrowRight />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day: string) => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium text-gray-800">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

// Example usage component with TypeScript
interface CalendarExampleProps {}

const CalendarExample: React.FC<CalendarExampleProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date): void => {
    setSelectedDate(date);
    // console.log('Selected date:', date);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Calendar Component (TypeScript)
        </h1>
        
        <Calendar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        
      </div>
    </div>
  );
};

export default CalendarExample;
export { Calendar };
export type { CalendarProps };
function ChevronArrow({className} : {className : string}){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-6 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>

    )
}

function ChevronArrowRight(){
    return (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
</svg>


    )
}