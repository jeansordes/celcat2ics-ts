import axios from 'axios';
import dotenv from 'dotenv-placeholder';
import express from 'express';
import FormData from 'form-data';
import moment from 'moment';
import { ical_builder } from './ical_builder';
dotenv.config({ path: __dirname + '/../.env' });

// init
const celcat_api_base_url = 'https://edt.univ-tlse3.fr/calendar2/Home/GetCalendarData',
    start_date = moment().format('YYYY-MM-DD'),
    end_date = moment().add(6, 'months').format('YYYY-MM-DD'),
    port = process.env.PORT || 8080,
    app = express(),
    is_dev_mode = process.env.APP_MODE == 'dev',
    celcat_api_fn = async (group_ids: string[]) => {
        // Celcat requires a Multipart form request
        const formData = new FormData();
        formData.append('calView', 'month');
        formData.append('resType', '103');
        formData.append('start', start_date);
        formData.append('end', end_date);
        group_ids.forEach((el, i) => {
            formData.append(`federationIds[${i}]`, el);
        });

        return await axios.post(celcat_api_base_url, formData, {
            headers: formData.getHeaders(),
        });
    }

app.get('/:group_id.ics', async (req, res) => {
    try {
        // PSN1CMA & PSN2CMA = L1 Info Semester 1 & 2
        let response = await celcat_api_fn(req.params.group_id == 'test' ? ['PSN1CMA', 'PSN2CMA'] : [req.params.group_id])
        res.send(ical_builder(response.data));
    } catch (err) {
        console.error(err);
        res.status(500).send(is_dev_mode ? err : 'Failure with Celcat API');
    }
});

app.get('/', async (req, res) => {
    if (is_dev_mode) {
        res.redirect('/test.ics');
    } else {
        res.send('<pre>Usage :<br>=======<br><br>/GROUP_ID.ics</pre>');
    }
});

app.listen(port, () => {
    console.log(`App available at http://celcat2ics.localhost:${port}`);
})