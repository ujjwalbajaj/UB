const http = require('http');
var https = require('https');
const { initConfigs } = require('./configs');

const app = require('./configs/app');


// http.createServer(app).listen(app.get('port'), () => {
//   console.log(`Smart Swap server listening on port ${app.get('port')}`);
// });


if (initConfigs.isPROD) {
  var httpsServer1 = https.createServer(credentials, app);
  console.log(initConfigs.dbName);
  httpsServer1.listen(initConfigs.httpsPort, () => { console.log(`Server Is Running On Port https:${initConfigs.httpsPort}`); });
} else {
  app.listen(initConfigs.httpPort, () => { console.log(`Server Is Running On Port http:${initConfigs.httpPort}`); });
}