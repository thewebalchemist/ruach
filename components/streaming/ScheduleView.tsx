import { Calendar, Clock, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Service {
  id: number | string;
  title: string;
  date: string;
  time: string;
  description: string;
  isRecurring?: boolean;
}

export default function ScheduleView() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [selectedTimezone, setSelectedTimezone] = useState('Africa/Nairobi');
  const [services, setServices] = useState<Service[]>([]);

  const timezones = [
    { value: 'Africa/Nairobi', label: '(GMT+3:00) Nairobi', offset: 3 },
    { value: 'Europe/London', label: '(GMT+0:00) London', offset: 0 },
    { value: 'America/New_York', label: '(GMT-5:00) New York', offset: -5 },
    { value: 'America/Los_Angeles', label: '(GMT-8:00) Los Angeles', offset: -8 },
  ];

  // Get next Sunday
const getNextSunday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (dayOfWeek === 0) {
    // It's Sunday - check if we're still before the last service (12:30 PM)
    const lastServiceTime = new Date(today);
    lastServiceTime.setHours(12, 30, 0, 0);
    
    if (today < lastServiceTime) {
      // Still before last service, return today
      return today;
    } else {
      // After last service, return next Sunday
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + 7);
      return nextSunday;
    }
  } else {
    // Not Sunday - calculate days until next Sunday
    const daysUntilSunday = 7 - dayOfWeek;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday;
  }
};

  // Generate Sunday services for the upcoming Sunday only
  const generateSundayServices = () => {
    const nextSunday = getNextSunday();
    const serviceTimes = [
      { time: '08:00', title: 'Sunday Service - First' },
      { time: '10:00', title: 'Sunday Service - Second' },
      { time: '12:30', title: 'Sunday Service - Third' },
    ];
    
    return serviceTimes.map((service) => ({
      id: `sunday-${nextSunday.toISOString()}-${service.time}`,
      title: service.title,
      date: nextSunday.toISOString().split('T')[0],
      time: service.time,
      description: 'Join us for worship and the Word',
      isRecurring: true,
    }));
  };

  useEffect(() => {
    const loadServices = async () => {
      try {
        const nextSunday = getNextSunday();
        const nextSundayStr = nextSunday.toISOString().split('T')[0];

        // Load any special services for this Sunday from Supabase
        const { data, error } = await supabase
          .from('service_schedule')
          .select('*')
          .eq('date', nextSundayStr)
          .order('time', { ascending: true });

        if (error) throw error;

        // Get regular Sunday services
        const sundayServices = generateSundayServices();
        
        // Combine and sort
        const allServices = [...sundayServices, ...(data || [])];
        allServices.sort((a, b) => {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });
        
        setServices(allServices);
      } catch (error) {
        console.error('Error loading services:', error);
        setServices(generateSundayServices());
      }
    };

    loadServices();

    // Reload at midnight to get new Sunday
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      loadServices();
      // Set up daily reload
      setInterval(loadServices, 86400000);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  useEffect(() => {
    if (services.length === 0) return;

    const calculateCountdown = () => {
      const [hours, minutes] = services[0].time.split(':');
      const nextServiceDate = new Date(services[0].date);
      nextServiceDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      const difference = nextServiceDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [services]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  const addToCalendar = (service: Service) => {
    const startDate = new Date(`${service.date}T${service.time}:00`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const event = {
      title: service.title,
      description: service.description,
      location: 'Ruach Church',
      start: formatDateForCalendar(startDate),
      end: formatDateForCalendar(endDate),
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}&dates=${event.start}/${
      event.end
    }`;

    window.open(googleCalendarUrl, '_blank');
  };

  const downloadICS = (service: Service) => {
    const startDate = new Date(`${service.date}T${service.time}:00`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ruach Church//EN
BEGIN:VEVENT
UID:${service.id}@ruachchurch.com
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:${service.title}
DESCRIPTION:${service.description}
LOCATION:Ruach Church
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ruach-${service.title.replace(/\s+/g, '-')}-${service.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTimeUntilService = (dateString: string, timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const serviceDate = new Date(dateString);
    serviceDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const difference = serviceDate.getTime() - now.getTime();

    if (difference < 0) return 'Past';
    if (difference < 3600000) return 'Starting soon';
    if (difference < 86400000) {
      const hoursUntil = Math.floor(difference / (1000 * 60 * 60));
      return `In ${hoursUntil}h`;
    }

    const daysUntil = Math.floor(difference / (1000 * 60 * 60 * 24));
    return `In ${daysUntil}d`;
  };

  const isServiceLive = (dateString: string, timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const serviceDate = new Date(dateString);
    serviceDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const difference = now.getTime() - serviceDate.getTime();

    return difference >= 0 && difference < 7200000;
  };

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading Services...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timezone Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Timezone
          </span>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="px-3 py-1.5 rounded-[1.5rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Countdown Timer - FIXED TEXT VISIBILITY */}
      <div className="bg-gradient-to-br from-[#BF0A30] to-[#9a0826] rounded-[2rem] p-6 shadow-2xl">
        <div className="text-center mb-4">
          <h3 className="text-xs uppercase tracking-wider font-bold mb-2 text-white opacity-90">
            Next Service
          </h3>
          <h2 className="text-3xl font-bold mb-1 text-white">{formatTime(services[0].time)}</h2>
          <p className="text-sm font-semibold text-white opacity-95">
            {formatDate(services[0].date).toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white bg-opacity-25 rounded-[1.5rem] p-3 text-center backdrop-blur-sm border border-white border-opacity-30">
            <div className="text-3xl font-bold text-gray-800 drop-shadow-lg">
              {String(countdown.days).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-800 opacity-90 mt-1">
              Days
            </div>
          </div>
          <div className="bg-white bg-opacity-25 rounded-[1.5rem] p-3 text-center backdrop-blur-sm border border-white border-opacity-30">
            <div className="text-3xl font-bold text-gray-800">
              {String(countdown.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-800 opacity-90 mt-1">
              Hours
            </div>
          </div>
          <div className="bg-white bg-opacity-25 rounded-[1.5rem] p-3 text-center backdrop-blur-sm border border-white border-opacity-30">
            <div className="text-3xl font-bold text-gray-800">
              {String(countdown.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-800 opacity-90 mt-1">
              Minutes
            </div>
          </div>
          <div className="bg-white bg-opacity-25 rounded-[1.5rem] p-3 text-center backdrop-blur-sm border border-white border-opacity-30">
            <div className="text-3xl font-bold text-gray-800">
              {String(countdown.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-800 opacity-90 mt-1">
              Seconds
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCalendar(services[0])}
            className="flex-1 cursor-pointer px-4 py-3 bg-white text-[#BF0A30] rounded-[2rem] text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            <span>Add to Calendar</span>
          </button>
          <button
            onClick={() => downloadICS(services[0])}
            className="px-4 py-3 bg-white bg-opacity-20 text-gray-800 rounded-[2rem] text-sm text-black font-bold hover:bg-opacity-30 transition-colors border border-white border-opacity-40"
            title="Download ICS"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upcoming Services - This Sunday Only */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white px-2">
          This Sunday's Services
        </h3>
        {services.map((service, index) => {
          const isLive = isServiceLive(service.date, service.time);
          const timeUntil = getTimeUntilService(service.date, service.time);

          return (
            <div
              key={service.id}
              className={`bg-white dark:bg-gray-900 rounded-[2rem] p-5 shadow-lg border-2 transition-all ${
                isLive
                  ? 'border-[#BF0A30]'
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#BF0A30] dark:hover:border-[#BF0A30]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {formatDate(service.date).toUpperCase()}
                    </p>
                    {isLive && (
                      <span className="px-2.5 py-0.5 bg-[#BF0A30] text-white text-xs font-bold rounded-full flex items-center space-x-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span>LIVE</span>
                      </span>
                    )}
                    {service.isRecurring && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                        Recurring
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatTime(service.time)}
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {service.title}
                  </p>
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {service.description}
                    </p>
                  )}
                  
                  <button
                    onClick={() => addToCalendar(service)}
                    className="text-xs text-[#BF0A30] hover:text-[#9a0826] font-semibold flex items-center space-x-1"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Add to calendar</span>
                  </button>
                </div>
                <div className="ml-4 text-right">
                  <div
                    className={`p-3 rounded-[1.5rem] ${
                      isLive
                        ? 'bg-[#BF0A30]'
                        : index === 0
                        ? 'bg-[#BF0A30] bg-opacity-10'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Clock
                      className={`w-6 h-6 ${
                        isLive
                          ? 'text-white'
                          : index === 0
                          ? 'text-[#BF0A30]'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
                    {timeUntil}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}