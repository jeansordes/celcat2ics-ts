import moment from "moment";
import { Event, EventCategory } from "./ical_builder";
import Uuid from 'uuid';
import { run_sqlite_queries } from "./db_util";

// Types
export interface CelcatEvent {
    allDay?: boolean,
    backgroundColor?: string,
    custom1?: string,
    custom2?: string,
    custom3?: string,
    department?: string,
    description?: string,
    end?: string,
    eventCategory?: string,
    faculty?: string,
    id?: string,
    module?: string,
    registerStatus?: string,
    site?: string,
    start?: string,
    studentMark?: string,
    textColor?: string,
}

// Init
const dateFormat = "YYYYMMDD'T'HHmmss'Z'";

// Functions
const clean_celcat_text = (desc: string | undefined = '') => {
    let compare_string = desc + '';
    let output_string = '';
    while (compare_string != output_string) {
        output_string = compare_string + '';
        compare_string = compare_string.replace("&#39;", "'")
            .replace("&#176;", "°")
            .replace("&#232;", "è")
            .replace("&#233;", "é")
            .replace("\r", '')
            .replace("\n\n", '\n')
            .replace("\\r", '\n')
            .replace("\\n", '\n')
            .replace("<br />", '\n')
            .trim();
    }
    return output_string;
}

const clean_celcat_category = (cat: string | undefined = ''): EventCategory => {
    switch (cat) {
        case 'TP':
        case 'TD':
        case 'COURS':
        case 'EXAMEN':
        case 'CONGES':
        case 'PONT':
        case 'FERIE':
            return cat;
        case "TP non encadré":
            return 'TP_NON_ENCADRE';
        case "COURS/TD":
            return 'TD';
        case "TD_LV":
            return 'TD';
        case "CONTROLE TERMINAL":
            return 'EXAMEN';
        default:
            // In case we don't know the category, we add it for an analysis after
            run_sqlite_queries([
                ['CREATE TABLE IF NOT EXISTS categories(col TEXT UNIQUE)'],
                ['INSERT OR IGNORE INTO categories VALUES (?)', cat],
            ]);
            return 'OTHER';
    }
}

const clean_celcat_location = (desc: string | undefined = '') => {
    let location_tmp = desc.match(/(.*)(\r|\n|\<br)/);
    return location_tmp != null ? location_tmp[1] : '';
}

const clean_celcat_date = (e: string | undefined = '') => moment(e).format(dateFormat);

export const celcat_to_ical_event = (evt: CelcatEvent): Event => {

    let location = clean_celcat_location(evt.description);
    let description = clean_celcat_text(evt.description).replace(location, '').trim();
    let summary:any = description.match(/(.*)\n/);
    summary = summary != null ? summary[1] : '';
    description = description.replace(summary, '').trim();
    let category = clean_celcat_category(evt.eventCategory);
    let output: Event = {
        summary: category + summary,
        // TODO remove the code of the UE from the summary (even more when it is found twice in the summary)
        // TODO add the TP/TD/EXAMEN in the summary, to make it easier to find out what the class is about
        // TODO apply a filter to display only TD, or only TP, or only EXAMEN,
        // so that users can have multiple calendars with a specific color for each type of event
        description: description,
        location: location,
        start: clean_celcat_date(evt.start),
        end: clean_celcat_date(evt.end),
        dtstamp: moment().format(dateFormat),
        uid: evt.id !== undefined ? evt.id : Uuid.v4(),
        category: category,
    };

    return output;
}