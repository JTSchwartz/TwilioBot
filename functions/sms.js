const qs = require('querystring')

exports.handler = async (event) => {
	const content = qs.parse(event.body)
	const cmd = content.Body.split(' ')
	
	const xmlReponse = `<Response>
							<Message>
								${cmd}
							</Message>
						</Response>`
	return {
		statusCode: 200,
		headers:    {
			"Content-Type": "text/xml"
		},
		body: xmlReponse,
	}
}
