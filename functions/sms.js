exports.handler = async (event) => {
	const { body } = JSON.parse(event.body)
	
	const xmlReponse = `<Response>
							<Message>
								${body}
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
