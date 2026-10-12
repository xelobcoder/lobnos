/**
 * Sends a POST request to a specified endpoint with the provided data.
 * Includes necessary headers and authorization token.
 * Parses the response and checks for a specific status and message.
 * If the status is 401 and the message is "Unauthorized", redirects the user to the login page.
 * Otherwise, returns the parsed response.
 *
 * @param {string} endpoint - The endpoint to send the POST request to.
 * @param {string} method - The HTTP method to use for the request (e.g., "POST", "PUT").
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<object>} - The parsed response from the POST request.
 */

import { buildApiUrl } from "../../lib/apiBaseUrl";

export async function customPost(endpoint, method, data, hash = false) {
    var requestBody = data;
    if (hash && hash === true) {
        if (process.env.HASH_KEY != undefined) {
            requestBody = {};
        } else {
            throw new Error("HASH_KEY not set in NODE_ENV");
        }
    }
    let response = await fetch(buildApiUrl(endpoint), {
        method: method,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });
    let datasource = await response.json();
    const { status, message } = datasource;

    if (status == 401 && message == "Unauthorized") {
        window.location.href = "/authentication/login";
    } else {
        return datasource;
    }
}
