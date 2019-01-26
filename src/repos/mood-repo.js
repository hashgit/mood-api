import _ from 'lodash';
import { MongoClient } from 'mongodb';

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
  async getAll() {
    // Connect to the database
    // we could reuse this db connection across requests but
    // this test application will not be used much

    let items;
    let client;

    try {
      client = await MongoClient.connect(this.MONGODB_URI, { useNewUrlParser: true });
      const db = client.db();

      items = await db.collection(this.moodCollection).find({}).toArray();
    } finally {
      if (client && client.close) {
        client.close();
      }
    }

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

    let client;

    try {
      client = await MongoClient.connect(this.MONGODB_URI, { useNewUrlParser: true });
      const db = client.db();
      const result = await db
        .collection(this.moodCollection)
        .insertOne(mood);

      return result.insertedCount === 1;
    } catch (err) {
      throw new Error(err);
    } finally {
      if (client && client.close) {
        client.close();
      }
    }
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

    let client;

    try {
      const updateModel = { note, updatedDateTime };
      client = await MongoClient.connect(this.MONGODB_URI, { useNewUrlParser: true });
      const db = client.db();
      const result = await db
        .collection(this.moodCollection)
        .updateOne({ id }, { $set: updateModel });

      return result.modifiedCount === 1;
    } catch (err) {
      throw new Error(err);
    } finally {
      if (client && client.close) {
        client.close();
      }
    }
  }

  /**
   * Finds a mood by ID
   * @param {string} id The mood ID
   * @returns {Promise<Mood>}
   */
  /* istanbul ignore next */
  async find(id) {
    let item;
    let client;

    try {
      client = await MongoClient.connect(this.MONGODB_URI, { useNewUrlParser: true });
      const db = client.db();

      item = await db.collection(this.moodCollection).findOne({ id });
    } finally {
      if (client && client.close) {
        client.close();
      }
    }

    return item;
  }
}
