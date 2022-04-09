import moment from "moment";
import { CelcatEvent, celcat_to_ical_event } from "./celcat_services";

export type EventCategory =
    'TP'
    | 'TD'
    | 'COURS'
    | 'EXAMEN'
    | 'TP_NON_ENCADRE'
    | 'CONGES'
    | 'FERIE'
    | 'PONT'
    | 'OTHER'

export interface Event {
    summary: string,
    description: string,
    location: string,
    start: string,
    end: string,
    dtstamp: string,
    uid: string,

    category: EventCategory,
}

export const ical_builder = (events: Event[]) => {
    const dateFormat = "yyyyMMdd'T'HHmmss'Z'";
    let output = `BEGIN:VCALENDAR\n`
        + `VERSION:2.0\n`
        + `PRODID:-//hacksw/handcal//NONSGML v1.0//EN\n`;

    events.forEach((celcat_evt: CelcatEvent) => {
        let evt: Event = celcat_to_ical_event(celcat_evt);

        if ((<EventCategory[]>['TP', 'COURS', 'EXAMEN', 'TP_NON_ENCADRE']).includes(evt.category)) {
            output += `\nBEGIN:VEVENT\n`
                + `SUMMARY: ${evt.summary}\n`
                + `LOCATION: ${evt.location}\n`
                + `DESCRIPTION: ${evt.description}\n`
                + `UID: ${evt.uid}\n`
                + `DTSTAMP:${evt.dtstamp}\n`
                + `DTSTART: ${evt.start}\n`
                + `DTEND: ${evt.end}\n`
                + `TRANSP:OPAQUE\n`
                + `FBTYPE:BUSY-UNAVAILABLE\n`
                + `END:VEVENT\n`;
        }
    })
    output += `END:VCALENDAR\n`;

    return output;
}