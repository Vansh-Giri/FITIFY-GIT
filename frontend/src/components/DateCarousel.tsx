import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';

interface DateCarouselProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateCarousel: React.FC<DateCarouselProps> = ({ selectedDate, setSelectedDate }) => {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3)); // Show 3 days past, today, 3 days future

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Select a Day</h2>
      <div className="flex space-x-3 overflow-x-auto pb-4">
        {dates.map(date => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`flex-shrink-0 w-20 h-24 rounded-lg flex flex-col items-center justify-center transition-colors
              ${isSameDay(selectedDate, date) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            <span className="text-sm font-semibold">{format(date, 'EEE')}</span>
            <span className="text-2xl font-bold">{format(date, 'd')}</span>
            <span className="text-xs">{format(date, 'MMM')}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateCarousel;