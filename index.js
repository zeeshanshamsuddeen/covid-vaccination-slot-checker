const axios = require('axios');
const cron = require('node-cron');
const notifier = require('node-notifier');
const moment = require('moment');

const notifyUser = (name, pin) => {
  notifier.notify(
    {
      title: 'Got the slot',
      message: `${name} : ${pin}`,
      sound: true, // Only Notification Center or Windows Toasters
      wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    }
  );
}

const getCurrentDate = () => moment().format('DD-MM-YYYY');

const addOneDay = (startdate) => moment(startdate, "DD-MM-YYYY").add(1, 'days').format('DD-MM-YYYY');

const foo = async (date, districtId) => {
  try {
    const config = {
      method: 'get',
      url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`,
      headers: {
        "User-Agent": "PostmanRuntime/7.28.0",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
      }
    };

    const response = await axios(config);
    const { centers } = response.data;
    centers.forEach(center => {
      const availableSession = center.sessions.find(session => session.available_capacity_dose1);
      if (availableSession) {
        notifyUser(center.name, center.pincode);
        console.log(center);
      }
    });

  } catch (error) {
    console.log('error: ', error);
  }
}

const checkAllDates = async () => {
  let date = getCurrentDate();
  date = addOneDay(date);
  for (let i = 0; i < 5; i += 1) {
    await foo(date, 297);
    date = addOneDay(date);
  }
}

const job = cron.schedule('* * * * *', () => {
  console.log('running');
  checkAllDates();
});

job.start();

