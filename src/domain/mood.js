import joi from 'joi';
import moment from 'moment';
import uuidV4 from 'uuid/v4';

export default class Mood {
  /**
   * Constructor
   * @param {Object} param
   * @param {string} param.id
   * @param {string} param.version
   * @param {string} param.createdDateTime
   * @param {string} param.updatedDateTime
   * @param {date} param.timestamp
   * @param {string} param.mood
   * @param {string} param.node
   */
  constructor({
    id,
    version,
    createdDateTime,
    updatedDateTime,
    timestamp,
    mood,
    note,
  } = {}) {
    this.id = id || uuidV4();
    this.version = version || '2018-11-23';
    this.createdDateTime = createdDateTime || moment.utc().format();
    this.updatedDateTime = updatedDateTime;
    this.timestamp = timestamp || moment.utc().format();
    this.mood = mood;
    this.note = note;
  }

  /**
   * Get object version for JSON stringify
   * @return {Object}
   */
  toJSON() {
    return Object.assign({}, this);
  }

  /**
   * Get constraints
   * @return {Object}
   */
  static get CONSTRAINTS() {
    return joi.object({
      id: joi.string().guid().required(),
      version: joi.string().required(),
      createdDateTime: joi.date().required(),
      updatedDateTime: joi.date(),
      timestamp: joi.date().required(),
      mood: joi.string().valid('Happy', 'Sad', 'Neutral').required(),
      note: joi.string(),
    });
  }
}
