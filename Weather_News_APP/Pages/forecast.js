function make_TempContent4(forcast) {
    //Number of total next for forcast days
    var forcast_days = forcast.length;
    const nxt_forcast_days = document.getElementById('forcast-days');
    if ((forcast_days - 1) > 0)
        nxt_forcast_days.innerHTML = "<p align=\"RIGHT\">For next " + (forcast_days - 1) + " days";
    else if ((forcast_days - 1) == 0)
        nxt_forcast_days.innerHTML = "<p align=\"RIGHT\">For Today Only";
    else {
        nxt_forcast_days.innerHTML = "<p align=\"RIGHT\">No Data Found. We are SORRY!!!";
        return;
    }

    //All Forcast data 
    const forcast_ele = document.getElementById('all-forcast-data');
    var forcast_html = "";

    for (let j = 0; j < forcast_days; j++) {
        forcast_html += "<div id=\"day-title\">";
        if (j == 0) forcast_html += "<u>Today</u>";
        else if (j == 1) forcast_html += "<u>Tommarow</u>";
        else forcast_html += "<u>" + forcast[j].date + "</u>";
        forcast_html += "</div>";

        forcast_html += "<div id=\"one-day-chunk\">";
        var lng = forcast[j].hour.length;
        for (let i = 0; i < lng; i++) {
            forcast_html += "<div id=\"one-hour-chunk\">";
        
            forcast_html += "<div id=\"time-forcast\">";
            var timelng = forcast[j].hour[i].time.length;
            forcast_html += forcast[j].hour[i].time.substring(timelng - 5, timelng);
            forcast_html += "</div>";

            //Change Imge property
            forcast_html += "<div><img src=\"http:" + forcast[j].hour[i].condition.icon;
            forcast_html += "\"></div>";

            forcast_html += "<div>" + forcast[j].hour[i].temp_c + "<sup>oC</sup>  ";
            forcast_html += forcast[j].hour[i].temp_f + "<sup>oF</sup></div>";
        
            forcast_html += "</div>";
        }   
        forcast_html += "</div>";
    }
   
    forcast_ele.innerHTML = forcast_html;
}