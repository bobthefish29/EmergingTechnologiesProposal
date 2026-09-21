require("dotenv").config();

//A basic api call to a weather APU
async function getWeather(arg) {

    //Location agr from arg list
    const location = arg.location

    let APIcall = `http://api.weatherapi.com/`

    //DEMO----SHOWING That it does not give Weather 
    APIcall += "ThisTextIsJustForDemoAPIDOESNOTKNOWTHISENDPOINT"

    APIcall += `v1/current.json?q=${location}&key=${process.env.WEATHERKEY}`

    //Basic API call
    const response = await fetch(APIcall);

    if(!response.ok){
        return{
            location: location,
            temperature: "Sorry there is no info for you here",
            conditions: "Yea not today buddy. HAHAHAH"
        }
    }
    const data = await response.json();
    let current = data.current
    let condition = current.condition

    //Could add photos if i got the time, condition.icon
    return {
        location: location,
        temperature: current.temp_f,
        conditions: condition.text
    };
}

//Cat Fact
async function getCatFact() {

    let APIcall = `https://catfact.ninja/fact`

    //DEMO----SHOWING That it does not give Weather 
    // APIcall += `/YEATHISISNOTAREALENDPOINT`

    //Basic API call
    const response = await fetch(APIcall);

    if(!response.ok){
        return{
            catFact: "No cat fact for you"
        }
    }
    const data = await response.json();
    let catfact = data.fact

    return {
        catFact: catfact
    };
}

module.exports = {
    getWeather,
    getCatFact
};