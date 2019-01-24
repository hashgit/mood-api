import MoodResponseException from './mood-response-exception';

export default class Response404Exception extends MoodResponseException {
  constructor(message, code) {
    super(404, message, code);
  }
}
