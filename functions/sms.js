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
			const jeepData = await weather(args[0])
			const jeepHours = findNextStorm(jeepData)
			
			if (jeepHours === -1) response = "Strip the Jeep naked, you've got at least a couple days"
			else if (jeepHours === 0) response = "Did you even think about looking out a window before you texted me?"
			else if (jeepHours === 1) response = "No such luck, it'll start raining soon"
			else if (jeepHours < 6) response = `You don't have that long, only ${jeepHours} hours till it rains. But we both know it's still worth it.`
			else response = `It won't start raining for at least ${jeepHours} hours. If that isn't enough time, do you really deserve that Jeep?`
			
			break;
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
			const currentWeather = weatherData["current"]["weather"][0]["main"]
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
