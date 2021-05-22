const LatLongToPlace_api = "47c187f2accd40f6b3e3de635bed5089";

document.addEventListener('DOMContentLoaded', function () {
    const inpt_txt_elemt = document.getElementById("ipt_loca-txt");
    inpt_txt_elemt.value = "";


    // To Get User Latitude and longitude through "geolocation"
    if (navigator.geolocation) {
        inpt_txt_elemt.placeholder = "Please Allow Us to find your location";
        inpt_txt_elemt.style.backgroundImage = "url('../data/gif/Snake-loading.gif')";
        
        navigator.geolocation.getCurrentPosition(async function (user_pos) {
            inpt_txt_elemt.placeholder = "Finding you location....wait a moment!";
            const place_name = await location_name(user_pos.coords.latitude, user_pos.coords.longitude);
            
            //add cookies in Lattiude and longitude of user position
            sessionStorage.setItem("lat", user_pos.coords.latitude);
            sessionStorage.setItem("long", user_pos.coords.longitude);
            
            //Error handling
            if (place_name == null) {
                alert("Error while getting your city name!!");
                inpt_txt_elemt.placeholder = "Your City Name";
                inpt_txt_elemt.style.backgroundImage = "";
                return;
            }

            inpt_txt_elemt.value = place_name;
            inpt_txt_elemt.placeholder = "Your City Name";

            show_temp();
            inpt_txt_elemt.style.backgroundImage = "";
        }, function (error) {
            inpt_txt_elemt.placeholder = "Your City Name";
            inpt_txt_elemt.style.backgroundImage = "";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    window.alert("User denied the request for Geolocation.")
                    break;
                case error.POSITION_UNAVAILABLE:
                    window.alert("Location information is unavailable.")
                    break;
                case error.TIMEOUT:
                    window.alert("The request to get user location timed out.")
                    break;
                case error.UNKNOWN_ERROR:
                    window.alert("An unknown error occurred.")
                    break;
            }
        })
    } else {
        console.log("Sorry!, Your browser doesn't support geolocation.");
    }
});

async function location_name(lat, long) {
    //making api url 
    var api_url = "https://api.opencagedata.com/geocode/v1/json?q=";
    api_url += lat + "+";
    api_url += long + "&key=";
    api_url += LatLongToPlace_api;
    // Fetching data from api
    var data = await fetch(api_url, {
        method: 'GET'
    });
    //Converting data to Json Format
    data = await data.json();
    //Error handling
    if (data.results[0] == null) {
        return;
    }
    //Rectifing data to what we want
    data = data.results[0].components;
    //Sending back pure data
    return (data.residential + "," + data.city + "," + data.state);
}