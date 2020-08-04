const qs = require("querystring")
const fetch = require("node-fetch");

function findNextStorm(weather) {
	if (isWeatherTypeRain(weather["current"])) return 0
	
	const hourly = weather["hourly"]
	
	for (let i = 0; i < hourly.length; i++) {
		if (isWeatherTypeRain(hourly[i])) return i + 1;
	}
	
	return -1
}

function isWeatherTypeRain(structure) {
	for (let i = 0; i < structure["weather"].length; i++) {
		if (structure["weather"][i]["main"] === "Rain") return true
	}
	
	return false
}

async function jeepResponse(data) {
	const jeepData = await weather(data)
	
	if (!jeepData) return "How am I supposed to know the weather if I don't know where you are?"
	
	const jeepHours = findNextStorm(jeepData)
	
	if (jeepHours === -1) return "Strip that Jeep naked, you've got at least a couple days."
	else if (jeepHours === 0) return "Did you even think about looking out a window before you texted me?"
	else if (jeepHours === 1) return "No such luck, better keep the doors and roof on. It'll start raining soon."
	else if (jeepHours < 6) return `You don't have that long, only ${jeepHours} hours till it rains. But we both know it's still worth it, at least take the doors off.`
	else return `It won't start raining for at least ${jeepHours} hours. If that isn't long enough to pull off the doors and roof, do you really deserve that Jeep?`
}

async function weather(zipCode) {
	if (!zipCode) return null
	
	const [lat, lon] = require("../us-zip-code-latitude-and-longitude.json")[zipCode]
	
	return await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=imperial&appid=${process.env.WEATHER_API_KEY}`)
		.then(response => response.json())
		.then(data => {
			return data
		}).catch((err) => {
			console.log(err)
			return null
		})
}

async function stormResponse(data) {
	const rainData = await weather(data)
	
	if (!rainData) return "Please provide a Zip Code to check for storms"
	
	const hoursTillRain = findNextStorm(rainData)
	
	if (hoursTillRain === -1) return "No rain is in the forecast for the next 48 hours"
	else if (hoursTillRain === 0) return "It is currently raining"
	else if (hoursTillRain === 1) return "It will start raining in the next hour"
	else return `It will start raining in ${hoursTillRain} hours`
}

exports.handler = async (event) => {
	const content = qs.parse(event.body)
	const [cmd, ...args] = content.Body.trim().split(" ")
	let response
	
	switch (cmd.toUpperCase()) {
		case "JEEP":
			response = await jeepResponse(args[0])
			break;
		case "RAIN":
		case "STORM":
			response = await stormResponse(args[0])
			break;
		case "WEATHER":
			const weatherData = await weather(args[0])
			response = (weatherData) ? `The current weather is: ${weatherData["current"]["weather"][0]["main"]}`
			                         : "Please provide a Zip Code to check the weather"
			break
		case "?":
			response = "Schwartz Bot Help:\n- Jeep: Find out how long you can leave the roof off for\n    Text: 'Jeep [ZIPCODE]'\n    Ex: Jeep 48038\n- Weather: Find out the current weather\n    Text: 'Weather [ZIPCODE]'\n    Ex: Weather 48038"
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
