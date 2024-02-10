import { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import multiMonthPlugin from '@fullcalendar/multimonth'
import { TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { GoogleCalendarEvent, GoogleCalendarEventResponse } from './type';


const GOOGLE_API_BASE_URL = "https://www.googleapis.com"

const CALENDAR_EVENTS_READ_ONLY_SCOPE = `${GOOGLE_API_BASE_URL}/auth/calendar.events.readonly`

const MARTA_AND_QUENTIN_CALENDAR_ID = "1a5c20261851f4bfa1241d49fc91dc05c3b9e40a67bc431292350085c7da21ae@group.calendar.google.com"

const App = () => {
  const [user, setUser] = useState<TokenResponse | null>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error),
    scope: CALENDAR_EVENTS_READ_ONLY_SCOPE,
  });

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const { data: { items }} = await axios.get<GoogleCalendarEventResponse>(`${GOOGLE_API_BASE_URL}/calendar/v3/calendars/${MARTA_AND_QUENTIN_CALENDAR_ID}/events`, {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        });

        setEvents(items)
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      fetchCalendarEvents();
    }
  }, [user]);

  return (
    <div>
      {user ? (
        <FullCalendar
          plugins={[multiMonthPlugin]}
          initialView='multiMonthYear'
          events={events.map(({ summary, start, end }) => ({
            title: summary,
            start: start.dateTime ?? start.date,
            end: end.dateTime ?? end.date
          }))}
          multiMonthMaxColumns={1}
          firstDay={1}
          eventColor='green'
        />
      ) : (
        <button onClick={() => login()}>Sign in with Google 🚀 </button>
      )}
    </div>
  );
}

export default App;
