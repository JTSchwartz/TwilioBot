const qs = require("querystring")

const weatherApi = "9239c74c31141aa609c11981816de107"


async function weather(zipCode) {
	const [lat, lon] = require('../us-zip-code-latitude-and-longitude.json')[zipCode]
	
	return await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=imperial&appid=${weatherApi}`)
		.then(response => response.json())
		.then(data => {
			return [data["lat"], data["lng"]]
		}).catch(() => {
			return null
		})
}

exports.handler = async (event) => {
	const content = qs.parse(event.body)
	const [cmd, ...args] = content.Body.split(" ")
	let response
	
	// switch (cmd.toUpperCase()) {
	// 	case "JEEP":
	// 	case "RAIN":
	// 	case "STORM":
	// 	case "WEATHER":
			response = await weather(args[0])
	// }
	
	const xmlReponse = `<Response>
							<Message>
								${[cmd, response].flat(Infinity)}
							</Message>
						</Response>`
	return {
		statusCode: 200,
		headers:    {
			"Content-Type": "text/xml"
		},
		body:       xmlReponse
	}
}
