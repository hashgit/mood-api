import joi from 'joi';

/**
 * @swagger
 * definitions:
 *   MoodModel:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       mood:
 *         type: string,
 *       note:
 *         type: string
 */

export default class MoodModel {
  /* istanbul ignore next */
  constructor({
    id,
    mood,
    note,
    timestamp,
  } = {}) {
    this.id = id;
    this.mood = mood;
    this.note = note;
    this.timestamp = timestamp;
  }

  // This is being used in controller which we don't unit test
  /* istanbul ignore next */
  static get CONSTRAINTS() {
    return joi.object({
      id: joi.string(),
      timestamp: joi.date(),
      mood: joi.string().valid('Happy', 'Sad', 'Neutral'),
      note: joi.string(),
    });
  }
}
