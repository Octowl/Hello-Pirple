/**
 * Primary API file
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const { StringDecoder } = require("string_decoder");
const fs = require("fs");

// Configuration
const config = require("./config");

// Instantiate HTTP server
const httpServer = http.createServer(unifiedServer);

// Start HTTP server
httpServer.listen(config.httpPort, () =>
  console.log(
    `The http ${config.envName} server is listening on port ${config.httpPort}`
  )
);

// Instantiate HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};
const httpsServer = https.createServer(httpsServerOptions, unifiedServer);

// Start HTTPS server
httpsServer.listen(config.httpsPort, () =>
  console.log(
    `The https ${config.envName} server is listening on port ${
      config.httpsPort
    }`
  )
);

// Unified Server Logic
function unifiedServer(req, res) {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path and query string
  const { pathname, query } = parsedUrl;
  const trimmedPath = pathname.replace(/^\/+|\/$/g, "");

  // Get the HTTP method and headers
  const { method, headers } = req;

  // Get the payload
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", data => (buffer += decoder.write(data)));

  req.on("end", () => {
    buffer += decoder.end();

    // Choose a handler
    const handler = router[trimmedPath] || handlers.notFound;

    // Construct data object
    const data = {
      path: trimmedPath,
      query,
      method,
      headers,
      payload: buffer
    };

    // Route the request
    handler(data, (status, payload) => {
      // Use 200 status by default
      status = typeof status === "number" ? status : 200;

      // Use empty object payload by default
      payload = typeof payload === "object" ? payload : {};

      // Convert payload to string
      const payloadString = JSON.stringify(payload);

      // Return response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(status);
      res.end(payloadString);
      console.log(`${method} ${trimmedPath} --> ${status}`, payload);
    });
  });
}

// Define router
const router = {};

// Hello handler
router.hello = (data, callback) => {
  const { name } = data.query;
  callback(200, { message: `GREETINGS ${name || "HUMAN"}!` });
};

// Not found handler
router.notFound = (data, callback) => {
  callback(404);
};
