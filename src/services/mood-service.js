import moment from 'moment';

import Mood from '../domain/mood';
import LogService from './log-service';
import Response404Exception from '../exceptions/response-404-exception';

export default class MoodService {
  /**
   * Constructor
   * @param {Object} param
   */
  /* istanbul ignore next */
  constructor({
    log, moodRepo,
  } = {}) {
    this.log = log || new LogService();
    this.moodRepo = moodRepo; // || new MoodRepo({ log: this.log });
  }

  /**
   * Create Mood from MoodModel
   * @param {MoodModel} model
   */
  async create(model) {
    if (!model) {
      throw new Error('Mood model is required');
    }

    const {
      id, mood, timestamp, note,
    } = model;

    if (id) {
      const existingMood = await this.moodRepo.find(id);

      if (existingMood) {
        throw new Error('Mood already exists', id);
      }
    }

    const moodEntity = new Mood({
      id, mood, timestamp, note,
    });
    const validation = Mood.CONSTRAINTS.validate(moodEntity);

    if (validation.error) {
      throw validation.error;
    }

    this.log.info('Creating mood', moodEntity);
    await this.moodRepo.save(moodEntity);
    return moodEntity;
  }

  /**
   * Update existing Mood from MoodModel
   * @param {MoodModel} model
   */
  async update(model) {
    if (!model) {
      throw new Error('Mood model is required');
    }

    const { id } = model;
    const mood = await this.moodRepo.find(id);

    if (!mood) {
      throw new Response404Exception('Mood not found');
    }

    mood.updatedDateTime = moment.utc().format();

    this.log.info('Updating mood', mood);
    await this.moodRepo.save(mood);

    return mood;
  }
}
