import { MongoClient } from 'mongodb';
import moment from 'moment';

import LogService from '../services/log-service';

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
  async getAll({ startDate, endDate }) {
    // Connect to the database
    // we could reuse this db connection across requests but
    // this test application will not be used much
    this.log.info({ startDate, endDate });

    const qry = {};
    if (startDate) {
      qry.$gte = moment.utc(startDate).format();
    }

    if (endDate) {
      qry.$lte = moment.utc(endDate).format();
    }

    const findQry = {};
    if (qry.$gte || qry.$lte) {
      findQry.timestamp = qry;
    }

    const items = await this.execute(db => db.collection(this.moodCollection).find(findQry).toArray());
    return items;
  }

  /**
   * Creates a mood
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

    const result = await this.execute(db => db
      .collection(this.moodCollection)
      .insertOne(mood));

    return result.insertedCount === 1;
  }

  /**
   * Updates a mood
   * @param {Mood} mood The mood
   */
  async update(mood) {
    if (!mood) {
      throw new Error('Mood is required');
    }

    const { id, note, updatedDateTime } = mood;

    if (!id) {
      throw new Error('Mood ID is required');
    }

    const updateModel = { note, updatedDateTime };
    const result = await this.execute(db => db
      .collection(this.moodCollection)
      .updateOne({ id }, { $set: updateModel }));

    return result.modifiedCount === 1;
  }

  /**
   * Finds a mood by ID
   * @param {string} id The mood ID
   * @returns {Promise<Mood>}
   */
  /* istanbul ignore next */
  async find(id) {
    const item = await this.execute(db => db.collection(this.moodCollection).findOne({ id }));
    return item;
  }

  /**
   * execute dbCommand
   * @param {func} dbCommand
   */
  async execute(dbCommand) {
    let client;
    let result = null;

    try {
      client = await MongoClient.connect(this.MONGODB_URI, { useNewUrlParser: true });
      const db = client.db();

      result = await dbCommand(db);
    } finally {
      if (client && client.close) {
        client.close();
      }
    }

    return result;
  }
}
