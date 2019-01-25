import _ from 'lodash';
import { MongoClient } from 'mongodb';

import LogService from '../services/log-service';
import Mood from '../domain/mood';

/**
 * The mood repository
 */
export default class MoodRepo {
  /**
   * Constructs a new mood repository
   * @param {LogService} [param.log] The log service
   */
  /* istanbul ignore next */
  constructor({
    log,
  } = {}) {
    this.MONGODB_URI = process.env.MONGODB_URI;
    this.log = log || new LogService();
    this.moodCollection = process.env.MOOD_COLLECTION || 'moods';
  }

  /**
   * Fetch all items
   * @returns {Promise<Mood[]>}
   */
  /* istanbul ignore next */
  async getAll() {
    // Connect to the database
    // we could reuse this db connection across requests but
    // this test application will not be used much

    const client = await MongoClient.connect(this.MONGODB_URI, { useNewUrlParser: true });
    const db = client.db();

    const items = await db.collection(this.moodCollection).find({}).toArray();
    return items;
  }
}
