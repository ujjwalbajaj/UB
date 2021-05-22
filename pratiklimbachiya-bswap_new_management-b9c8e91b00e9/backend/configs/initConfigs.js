const dotenv = require('dotenv').config();
const isPROD = process.env.NODE_ENV == "PROD" ? true : false;

const chainId = 56;

module.exports = {
    isPROD: isPROD,
    httpPort: process.env.HTTP_PORT,
    httpsPort: process.env.HTTPS_PORT,
    dbName: process.env.DB_NAME,
    dbUserName: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    EMAIL_CREDENTIAL_USERNAME: process.env.EMAIL_CREDENTIAL_USERNAME,
    EMAIL_CREDENTIAL_PASSWORD: process.env.EMAIL_CREDENTIAL_PASSWORD,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    DEVELOPER_EMAIL: process.env.DEVELOPER_EMAIL
}

