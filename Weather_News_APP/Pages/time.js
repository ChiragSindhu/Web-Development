const time_api_key = "76YXYKOLGKGJ";

async function get_time(time_zone) {
    var url = "http://api.timezonedb.com/v2.1/get-time-zone?key=";
    url += time_api_key + "&format=json&by=zone&zone=" + time_zone;

    var rawdata = await fetch(url, {
        method: 'GET'
    });

    var time_data = await rawdata.json();
    //console.log(time_data);
    return time_data;
}