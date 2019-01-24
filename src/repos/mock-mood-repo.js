/* istanbul ignore file */
import _ from 'lodash';

import LogService from '../services/log-service';
import Mood from '../domain/mood';

/**
 * The mood repository
 */
export default class MoodRepoMock {
  /**
   * Constructs a new mood repository
   * @param {LogService} [param.log] The log service
   */
  /* istanbul ignore next */
  constructor({
    log,
    storage,
  } = {}) {
    this.storage = storage || [];
    this.log = log || new LogService();
    this.log.info(this.storage);
  }

  /**
   * Fetch all items
   * @returns {Promise<Mood[]>}
   */
  /* istanbul ignore next */
  async getAll() {
    const Items = this.storage;
    return Items;
  }

  /**
   * Finds a mood by ID
   * @param {string} id The mood ID
   * @returns {Promise<Mood>}
   */
  /* istanbul ignore next */
  async find(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    const Item = _.find(this.storage, ['id', id]);
    return Item;
  }

  /**
   * Deletes a mood and all their attributes (best effort) by ID
   * @param {string} id The mood ID
   */
  /* istanbul ignore next */
  async delete(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    const removedMoods = _.remove(this.storage, c => c.id === id);

    if (removedMoods.length === 0) {
      throw new Error('No mood found');
    }
  }

  /**
   * Creates or updates a mood
   * @param {Mood} mood The mood
   */
  async save(mood) {
    if (!mood) {
      throw new Error('Mood is required');
    }

    const { id } = mood;

    if (!id) {
      throw new Error('Mood ID is required');
    }

    const existingMoodIndex = _.findIndex(this.storage, ['id', id]);

    if (existingMoodIndex > -1) {
      this.log.info('Updating existing mood', mood);
      this.storage[existingMoodIndex] = new Mood(mood);
    } else {
      this.log.info('Creating new mood', mood);
      this.storage.push(new Mood(mood));
    }
  }
}
