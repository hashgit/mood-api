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
   * get all moods
   */
  async getAll() {
    const items = await this.moodRepo.getAll();

    return items.map(item => ({
      id: item.id,
      mood: item.mood,
      note: item.note,
      timestamp: item.timestamp,
    }));
  }

  /**
   * Find Mood by id
   * @param {uuid} id
   */
  async find(moodId) {
    const {
      id,
      timestamp, mood, note,
    } = await this.moodRepo.find(moodId);

    return {
      id, timestamp, mood, note,
    };
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
    const result = await this.moodRepo.save(moodEntity);
    return result ? moodEntity : null;
  }

  /**
   * Update existing Mood from MoodModel
   * @param {MoodModel} model
   */
  async update(model) {
    if (!model) {
      throw new Error('Mood model is required');
    }

    const { id, note } = model;

    const mood = new Mood({
      id, note,
    });

    this.log.info('Updating mood', mood);
    const result = await this.moodRepo.update(mood);
    return result;
  }
}
