'use strict';

const Promise = require('promise'),
    request = require('request'),
    jsonHandler = require('../common/json-handler'),
    responder = require('../common/responder');

module.exports = function handleContentCall(clientRequest, clientResponse) {

    const category = clientRequest.params.category,
        uuid = clientRequest.params.id,
        config = {
            'v1': {
                'url': process.env.FT_API_URL + process.env.FT_V1_API_ROUTE + uuid + '?apiKey=' + process.env.FT_API_KEY,
                'parser': require('../../parsers/content.v1.parser')
            },
            'v2': {
                'url': process.env.FT_API_URL + process.env.FT_V2_API_ROUTE + uuid + '?apiKey=' + process.env.FT_API_KEY,
                parser: require('../../parsers/content.v2.parser')
            }
        };

    function parse(response) {
        return config[category].parser.handle(response);
    }

    function fetch(url) {
        return new Promise(function (resolve, reject) {
            request(url, function (filterErr, response) {
                if (filterErr) {
                    reject(filterErr);
                } else {
                    resolve(jsonHandler.parse(response.body));
                }
            });
        });
    }

    fetch(config[category].url).then(parse).then(article => {
        responder.send(clientResponse, {
            status: 200,
            data: article
        });
    }).catch(error => {
        console.error('[api-get-content] Error', error.statusCode);
        responder.reject(clientResponse, error);
    });
};
