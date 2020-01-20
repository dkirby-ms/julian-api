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
var b2coptions;
var b2cDomainHost = "dakirb2c.b2clogin.com";
var tenantIdGuid = "8736fc97-f3e8-4cb7-a4ac-2a604cbd7c34";
var policyName = "B2C_1_signupsignin";

function b2coptions() {
    return new Promise(function (resolve, reject) {
        var appid;
        keyvaultClient.getSecret('b2c-clientappid').then(function (secret) {
            appid = secret.value;
            var options = {
                identityMetadata: "https://" + b2cDomainHost + "/" + tenantIdGuid + "/" + policyName + "/v2.0/.well-known/openid-configuration/",
                clientID: appid,
                policyName: policyName,
                isB2C: true,
                validateIssuer: false,
                loggingLevel: 'info',
                loggingNoPII: false,
                passReqToCallback: false
            };
            resolve(options);
        }).catch(function (err) {
            return reject(err);
        });
    });
}

let opts = null;
function getb2coptions() {
    if (!opts) {
        opts = b2coptions();
    }
    return opts;
}
exports.getb2coptions = getb2coptions;

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