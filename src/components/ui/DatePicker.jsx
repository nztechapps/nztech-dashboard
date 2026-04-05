import { useState, useRef, useEffect } from 'react';

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function DatePicker({ value, onChange, label, placeholder = 'Seleccionar fecha' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value + 'T00:00:00') : new Date()
  );
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, bottom: 'auto' });
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const parseDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayName = (index) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[index];
  };

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = formatDate(selectedDate);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleOpenPopup = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const popupHeight = 300;

      let newPosition = { top: 'auto', left: rect.left, bottom: 'auto' };

      if (spaceBelow >= popupHeight) {
        newPosition.top = rect.bottom + 4;
        newPosition.bottom = 'auto';
      } else if (spaceAbove >= popupHeight) {
        newPosition.bottom = window.innerHeight - rect.top + 4;
        newPosition.top = 'auto';
      } else {
        newPosition.top = rect.bottom + 4;
        newPosition.bottom = 'auto';
      }

      setPopupPosition(newPosition);
      setIsOpen(!isOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Días del mes anterior
    const prevMonth = currentDate.getMonth() === 0
      ? new Date(currentDate.getFullYear() - 1, 11, 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i),
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 filas × 7 columnas
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = currentDate.getMonth() === 11
        ? new Date(currentDate.getFullYear() + 1, 0, 1)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
      });
    }

    return days;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays = generateCalendarDays();
  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
          {label}
        </label>
      )}

      {/* Input Display */}
      <div
        ref={inputRef}
        onClick={handleOpenPopup}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#13131A',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px 12px',
          color: value ? 'white' : 'rgba(255,255,255,0.4)',
          fontSize: '14px',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        <span style={{ flex: 1 }}>
          {value ? parseDate(value) : placeholder}
        </span>
        <IconCalendar />
      </div>

      {/* Popup Calendario */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: popupPosition.top === 'auto' ? 'auto' : popupPosition.top,
            bottom: popupPosition.bottom === 'auto' ? 'auto' : popupPosition.bottom,
            left: popupPosition.left,
            backgroundColor: '#13131A',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 9999,
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconChevronLeft />
            </button>

            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
              {monthName} {year}
            </div>

            <button
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconChevronRight />
            </button>
          </div>

          {/* Días de la semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: '500',
                  paddingBottom: '4px',
                }}
              >
                {getDayName(i)}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {calendarDays.map((dayObj, idx) => {
              const isSelected = value === formatDate(dayObj.date);
              const isToday = dayObj.date.getTime() === today.getTime();

              return (
                <button
                  key={idx}
                  onClick={() => dayObj.isCurrentMonth && handleSelectDate(dayObj.day)}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected ? 'none' : isToday ? '1px solid rgba(0,229,160,0.5)' : 'none',
                    backgroundColor: isSelected ? '#00E5A0' : 'transparent',
                    color: isSelected ? '#0A0A0F' : dayObj.isCurrentMonth ? 'white' : 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    cursor: dayObj.isCurrentMonth ? 'pointer' : 'default',
                    fontSize: '13px',
                    fontWeight: isSelected || isToday ? '600' : '400',
                    padding: 0,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (dayObj.isCurrentMonth && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  disabled={!dayObj.isCurrentMonth}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
