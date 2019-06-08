const request = require('request');


const recommend = (callback) => {
    const url = 'https://kunenz8304.execute-api.us-east-1.amazonaws.com/prod/my-resource?myParam=jeshop'

    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to recommend service!', undefined);
        } else if (body.error) {
            callback('Unable to find recommend products', undefined);
        } else {
            callback(undefined, body);
        }
    })
}

module.exports = recommend;