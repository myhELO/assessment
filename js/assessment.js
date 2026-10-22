/**
 * OpenAI settings. Paste the API key from your invite email below.
 */
const OPENAI_API_KEY = '<PASTE OPENAI API KEY HERE>';
const OPENAI_MODEL = 'gpt-6-luna';

/**
 * Namespace.
 *
 * @type {Object}
 */
var assessment = {};

/**
 * Send an API call to the FDA and execute a callback with the results.
 *
 * @param {string} url The API endpoint to call
 * @param {Function} callback Function to call upon successful execution of
 * the API call.
 */
assessment.fda_api = function(url, callback) {
  const callback_ = function() {
    const json = JSON.parse(this.responseText);
    callback(json.results);
  };

  const request = new XMLHttpRequest();
  request.addEventListener('load', callback_);
  request.open('GET', url);
  request.send();
};

/**
 * Send an API call to OpenAI and execute a callback with the results.
 *
 * @link https://platform.openai.com/docs/api-reference/responses
 *
 * @param {string|Array} input The prompt (or list of messages) to send.
 * @param {Function} callback Function to call upon successful execution of
 * the API call.
 */
assessment.openai_api = function(input, callback) {
  const callback_ = function() {
    if (this.status !== 200) {
      assessment.openai_error();
      console.error('OpenAI Error: ' + this.responseText);
      return;
    }

    const json = JSON.parse(this.responseText);
    let text = '';
    json.output.forEach(function(item) {
      if (item.type === 'message') {
        item.content.forEach(function(part) {
          if (part.type === 'output_text') {
            text += part.text;
          }
        });
      }
    });
    callback(text);
  };

  const request = new XMLHttpRequest();
  request.addEventListener('load', callback_);
  request.addEventListener('error', assessment.openai_error);
  request.open('POST', 'https://api.openai.com/v1/responses');
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', 'Bearer ' + OPENAI_API_KEY);
  request.send(JSON.stringify({
    model: OPENAI_MODEL,
    input: input
  }));
};

/**
 * Show a friendly message when an OpenAI call doesn't go through.
 */
assessment.openai_error = function() {
  const message = document.createElement('div');
  message.className = 'openai_error';
  message.innerText = 'The AI call didn\'t go through. Double-check the API ' +
    'key you pasted at the top of assessment.js. If it still isn\'t working, ' +
    'email us and we\'ll help.';
  document.body.appendChild(message);
};

/**
 * Runs when the document is fully loaded and ready to go.
 */
assessment.ready = function() {
  const header = new component.header();
  header.render(document.body);

  const visualization = new component.visualization();
  visualization.render(document.body);
};

/**
 * Extends one class with another.
 *
 * @link https://oli.me.uk/2013/06/01/prototypical-inheritance-done-right/
 *
 * @param {Function} destination The class that should be inheriting things.
 * @param {Function} source The parent class that should be inherited from.
 *
 * @return {Object} The prototype of the parent.
 */
assessment.extend = function(destination, source) {
  destination.prototype = Object.create(source.prototype);
  destination.prototype.constructor = destination;

  return source.prototype;
};
