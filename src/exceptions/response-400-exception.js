import MoodResponseException from './mood-response-exception';

export default class Response400Exception extends MoodResponseException {
  constructor(message, code) {
    super(400, message, code);
  }
}
