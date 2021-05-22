const Weather_api = "a341c029a9ed48ad85354611211803";
const Static_map_api = "ijkGFg4uS2shXYNMTwwOD3qAjpcnkwx7";
var time_interval;

async function show_temp() {
    const place_name = document.getElementById("ipt_loca-txt").value;
    const temp_Data = await getTempData(place_name);

    //Error handling
    if (temp_Data.error != null) {
        alert(temp_Data.error.message);
        return;
    }

    // Make HTML for content
    make_TempContent1(temp_Data);
    
    //Temperature DATA OF REGION
    const Temperature = temp_Data.current;
    make_TempContent2(Temperature);

    //Forcast Data of the REGION
    const forcast = temp_Data.forecast.forecastday;
    make_TempContent3(forcast);
    make_TempContent4(forcast);

    //GET TIME:
    clearInterval(time_interval);
    var raw_time = (await get_time(temp_Data.location.tz_id)).formatted;
    var temp_time = new Date(raw_time);
    document.getElementById('one-day-chunk').scrollLeft = temp_time.getHours()*188;

    //Update time every second....
    time_interval = setInterval(function () {
        var time = new Date(raw_time);
        
        var time_txt = "Current Time - " + time.getHours() + ":" + time.getMinutes() + ":";
        time_txt += time.getSeconds().toString();
        document.getElementById('time').innerHTML = time_txt;

        time.setTime(time.getTime() + 1000);
        raw_time = time.toString();
    }, 1000);

    //Save Temperature for future use in SessionStorage
    sessionStorage.setItem("TempC",Temperature.temp_c);
    sessionStorage.setItem("TempF",Temperature.temp_f);
    
    console.log(temp_Data);
}

async function getTempData(place_name) {
    var weather_api_url = "http://api.weatherapi.com/v1/forecast.json?key=";
    weather_api_url += Weather_api + "&q="; 
    weather_api_url += place_name + "&days=5&aqi=yes&alerts=no";

    var data = await fetch(weather_api_url, {
        method : 'GET'
    });

    data = await data.json();
    return data;
}

function make_TempContent1(temp_Data){
    //LOACATION DATA OF REGION
    const location = temp_Data.location;
    
    const temp_content = document.getElementById("temp-country-content");
    temp_content.innerHTML ="<div id=\"location-temp-country\">" + location.country + "</div>";
    
    const location_cont = document.getElementById("location_content");
    var con_html = location.name + ", " + location.region;
    location_cont.innerHTML = con_html;


    //Also Fetch Map with respective location
    const img_element = document.getElementById('location-map');
    var img_url = "https://www.mapquestapi.com/staticmap/v5/map?locations=";
    if (sessionStorage.getItem("lat") != null && sessionStorage.getItem("long") != null) {
        img_url += sessionStorage.getItem("lat") + "," + sessionStorage.getItem("long");
        img_url += "&size=@2x&key=" + Static_map_api;

        //RESETING LAT AND LONG  and it is important
        sessionStorage.removeItem("lat");
        sessionStorage.removeItem("long");
    } else {
        img_url += location.name + "&size=@2x&key=" + Static_map_api;
    }
    //console.log(img_url);
    var img_html = "<img id=\"map\" src=\"" + img_url + "\"";
    img_html += " width=480px height=350px";
    img_html += ">";
    img_element.innerHTML = img_html;
}

function make_TempContent2(Temperature) {
    //UPDATED TIME
    const update_time = document.getElementById("temp-update");
    var update_temp_html = "Updated on " + Temperature.last_updated;
    update_time.innerHTML = update_temp_html;

    const temperatrue_simple = document.getElementById("temp-image");
    var temp_sple = "<img src=\"http:";
    temp_sple += Temperature.condition.icon + "\">";
    temperatrue_simple.innerHTML = temp_sple;

    const temperatrue_real = document.getElementById("real-temp");
    var temp_real = Temperature.temp_c + "<sup>oC</sup>";
    temperatrue_real.innerHTML = temp_real;

    //Also text weather condition
    const cond_element = document.getElementById("condition");
    cond_element.innerHTML = Temperature.condition.text + " <font size=\"2\">-Weather Condition</font>";

    //isDay
    const day_element = document.getElementById("is_day");
    if (Temperature.is_day == 1) day_element.innerHTML = "Day";
    else day_element.innerHTML = "Night";

    //Air Quality
    const air_q_elem = document.getElementById("air-q-2_10");
    const Quality = (Temperature.air_quality.pm10).toFixed(2);
    if (Quality <= 50) {
        air_q_elem.innerHTML = "<font color=\"#6aff00\">" + Quality;
        air_q_elem.innerHTML += "<font size=\"3\"> - Best In the World</font>";
    }else if (Quality > 50 && Quality <= 100) {
        air_q_elem.innerHTML = "<font color=\"orange\">" + Quality;
        air_q_elem.innerHTML += "<font size=\"3\"> - Just Survival</font>";
    }else if (Quality > 100 && Quality <= 150) {
        air_q_elem.innerHTML = "<font color=\"#eb6c42\">" + Quality;
        air_q_elem.innerHTML += "<font size=\"3\"> - Unhealthy</font>";
    }else if (Quality > 150) {
        air_q_elem.innerHTML = "<font color=\"red\">" + Quality;
        air_q_elem.innerHTML += "<font size=\"3\"> - Worst In the World</font>";
    }
    air_q_elem.innerHTML += "</font>";

    //Cloud Percentage--
    const cloud_per = document.getElementById('pp1');
    if (Temperature.cloud <= 15) {
        cloud_per.innerText = "Few clouds!!";
        cloud_per.style.width = "auto";
    }else {
        cloud_per.innerText = Temperature.cloud + "%";
        cloud_per.style.width = Temperature.cloud / 1.8 + "%";
    }
}

function make_TempContent3(forcast) {
    //Sun Rise and Sun Set
    const sun_rise_ele = document.getElementById('sun-rise');
    const sun_set_ele = document.getElementById('sun-set');

    sun_rise_ele.innerHTML = "Sun Rise ";
    sun_set_ele.innerHTML = "Sun Set ";

    sun_rise_ele.innerHTML += "<p align=\"RIGHT\" style=\"color:#f7e11b;\">" + forcast[0].astro.sunrise;
    sun_set_ele.innerHTML += "<p align=\"RIGHT\" style=\"color:#e69007;\">" + forcast[0].astro.sunset;

    //Max and Min Temperature
    const day_max_temp = document.getElementById('day-max-temp');
    const day_min_temp = document.getElementById('day-min-temp');

    day_max_temp.innerHTML = "Max. Temp. ";
    day_min_temp.innerHTML = "Min. Temp. ";
    
    var maxtemp_html = "";
    var mintemp_html = "";

    maxtemp_html += "<p align=\"RIGHT\" style=\"color:#f7e11b;\">" + forcast[0].day.maxtemp_c;
    maxtemp_html +=  "<sup>oC</sup> | " + forcast[0].day.maxtemp_f + "<sup>oF</sup></p>";
    
    mintemp_html += "<p align=\"RIGHT\" style=\"color:#e69007;\">" + forcast[0].day.mintemp_c;
    mintemp_html += "<sup>oC</sup> | " + forcast[0].day.maxtemp_f + "<sup>oF</sup></p>";
    
    day_max_temp.innerHTML += maxtemp_html;
    day_min_temp.innerHTML += mintemp_html;

    //Moon Illumination
    const moon_ill = document.getElementById('pp2');
    moon_ill.innerText = forcast[0].astro.moon_illumination + "%";
    moon_ill.style.width = forcast[0].astro.moon_illumination / 2 + "%"
}

function changetempscale() {
    var value = document.getElementById("real-temp").innerHTML;
   
    //From Back "7" will give info. about celcius or fehrnite
    if (value[value.length - 7] == 'C') {
        value = sessionStorage.getItem("TempF") + "<sup>oF</sup>";
    } else {
        value = sessionStorage.getItem("TempC") + "<sup>oC</sup>";
    }

    document.getElementById("real-temp").innerHTML = value;
};