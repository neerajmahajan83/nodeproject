const serverless = require("serverless-http");
const app = require("./index");

const handler = serverless(app);

module.exports.handler = async (event, context) => {
	// Allow Lambda to return the response even if there are open handles
	context.callbackWaitsForEmptyEventLoop = false;
	return handler(event, context);
};