const qs = require("querystring")
const fetch = require("node-fetch");

const weatherApi = "9239c74c31141aa609c11981816de107"

function findNextStorm(weather) {
	if (isWeatherTypeRain(weather["current"])) return 0
	
	const hourly = weather["hourly"]
	
	for (let i = 0; i < hourly.length; i++) {
		if (isWeatherTypeRain(hourly[i])) return i + 1;
	}
	
	return -1
}

async function weather(zipCode) {
	const [lat, lon] = require('../us-zip-code-latitude-and-longitude.json')[zipCode]
	
	return await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=imperial&appid=${weatherApi}`)
		.then(response => response.json())
		.then(data => {
			return data
		}).catch((err) => {
			console.log(err)
			return null
		})
}

function isWeatherTypeRain(structure) {
	for (let i = 0; i < structure["weather"].length; i++) {
		if (structure["weather"][i]["main"] === "Rain") return true
	}
	
	return  false
}

exports.handler = async (event) => {
	const content = qs.parse(event.body)
	const [cmd, ...args] = content.Body.trim().split(" ")
	let response
	
	switch (cmd.toUpperCase()) {
		case "JEEP":
		case "RAIN":
		case "STORM":
			const rainData = await weather(args[0])
			const hoursTillRain = findNextStorm(rainData)
			
			if (hoursTillRain === -1) response = "No rain is in the forecast for the next 48 hours"
			else if (hoursTillRain === 0) response = "It is currently raining"
			else if (hoursTillRain === 1) response = "It will start raining in the next hour"
			else response = `It will start raining in ${hoursTillRain} hours`
			
			break;
		case "WEATHER":
			const weatherData = await weather(args[0])
			const currentWeather = weatherData["current"][0]["main"]
			response = `The current weather is: ${currentWeather}`
			
			break
		case "?":
		case "HELP":
			response = "Schwartz Bot Help:\n-Jeep: Find out how long you can leave the roof off for\n    Text: 'Jeep [ZIPCODE]'\nEx: Jeep 48038\n-Weather: Find out the current weather\n    Text: 'Weather [ZIPCODE]'\nEx: Weather 48038"
			break
	}
	
	const xmlResponse = `<Response>
							<Message>
								${response}
							</Message>
						</Response>`
	return {
		statusCode: 200,
		headers:    {
			"Content-Type": "text/xml"
		},
		body:       xmlResponse
	}
}
