exports.handler = async () => {
	const xmlReponse = `<Response>
							<Message>
								Ok
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
