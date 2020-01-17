// config.js
const env = process.env.NODE_ENV; // 'dev' or 'test'

// keyvault.js
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const vaultName = "B2CLabVault";
const url = `https://${vaultName}.vault.azure.net`;
const azPodIdentity = new DefaultAzureCredential();
const keyvaultClient = new SecretClient(url, azPodIdentity);
exports.keyvaultClient = keyvaultClient;

// b2cConfig.js 
var b2cDomainHost = "dakirb2c.b2clogin.com";
var tenantIdGuid = "8736fc97-f3e8-4cb7-a4ac-2a604cbd7c34";
var policyName = "B2C_1_signupsignin";
var b2coptions = {
    identityMetadata: "https://" + b2cDomainHost + "/" + tenantIdGuid + "/" + policyName + "/v2.0/.well-known/openid-configuration/",
    clientID: async function() {
        let appId = await config.keyvaultClient.getSecret('b2c-clientappid');
        return appId.value;
    },
    policyName: policyName,
    isB2C: true,
    validateIssuer: false,
    loggingLevel: 'info',
    loggingNoPII: false,
    passReqToCallback: false
};
exports.b2coptions = b2coptions;

// // db.js
// const mongoose = require('mongoose');
// const config = require('./config');
// const { db: { host, port, name } } = config;
// const connectionString = `mongodb://${host}:${port}/${name}`;
// mongoose.connect(connectionString);

// // app.js
// const express = require('express');
// const config = require('./config');

// const app = express();
// app.listen(config.app.port);