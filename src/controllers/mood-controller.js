import express from 'express';
// Use mock repo
import MoodRepo from '../repos/mood-repo';
// import MoodRepoMock from '../repos/mock-mood-repo';
import MoodService from '../services/mood-service';
import MoodModel from '../domain/mood-model';

const router = new express.Router();

router.use((req, res, next) => {
  req.moodRepo = new MoodRepo({ log: req.log });
  req.moodService = new MoodService({ moodRepo: req.moodRepo, log: req.log });
  next();
});

/**
 * @swagger
 * /{id}:
 *  get:
 *    tags:
 *      - mood
 *    summary: Retrieve single mood by its ID
 *    description: >
 *      Retrieve single mood by its ID.
 *    security:
 *      - apiKeyAuthorization: []
 *    parameters:
 *      - name: id
 *        description: Specify a mood ID for retrieval
 *        required: true
 *        in: path
 *        type: string
 *    responses:
 *      200:
 *        description: mood retrieved
 *      400:
 *        description: The request was rejected - missing ID
 *      404:
 *        description: Object not found
 *      500:
 *        description: Internal server error
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    req.log.warn('ID is required');
    return res.status(400).json({
      errors: [{
        title: 'Invalid request - missing ID',
      }],
    });
  }

  try {
    req.log.info(`Fetching mood by ID ${id}`);
    const mood = await req.moodRepo.find(id);

    if (mood) {
      return res.json({
        data: {
          type: 'mood',
          id: mood.id,
          attributes: mood,
        },
      });
    }

    req.log.warn('mood not found', { id });
    return res.status(404).end();
  } catch (error) {
    req.log.error('mood fetching by ID failed', error);
    return res.status(error.status || 500).json({
      errors: [{
        status: error.status || 500,
        title: error.message,
      }],
    });
  }
});

/**
 * @swagger
 * /:
 *  get:
 *    tags:
 *      - mood
 *    summary: Return all moods or find moods by params specified in query string
 *    description: >
 *      If no query param is provided it will fetch all moods others it will search for moods by matching the params sent in query string
 *    security:
 *      - apiKeyAuthorization: []
 *    parameters:
 *      - name: e
 *        in: query
 *        description: Email Unverified
 *        required: false
 *        type: string
 *        example: mood?e=sample_name@email.com
 *      - name: ev
 *        in: query
 *        description: Email Verified
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: mood retrieved
 *      400:
 *        description: The request was rejected - incorrect query param
 *      500:
 *        description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    // For now we are returning all moods from DB
    // /mood
    req.log.info('Fetching all moods');

    const moods = await req.moodService.getAll();
    return res.json({
      data: moods.map(mood => ({
        type: 'mood',
        id: mood.id,
        attributes: mood,
      })),
    });
  } catch (error) {
    req.log.error('Searching for moods failed', error);
    return res.status(error.status || 500).json({
      errors: [{
        status: error.status || 500,
        title: error.message,
      }],
    });
  }
});

/**
 * @swagger
 * /:
 *  post:
 *    security:
 *      - apiKeyAuthorization: []
 *    tags:
 *      - mood
 *    summary: Create new mood (and don't check for existing matches)
 *    description: >
 *      This API does "force create" of mood without checking of any existing matches of attributes in DB based.
 *      It reports failure if mood ID already exists
 *    parameters:
 *      - name: body
 *        in: body
 *        description: mood values
 *        required: true
 *        schema:
 *          $ref: '#/definitions/mood'
 *    responses:
 *      204:
 *        description: mood created
 *      400:
 *        description: The request was rejected - validation failed
 *      500:
 *        description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    const model = new MoodModel({ id: req.body.id, mood: req.body.mood, note: req.body.note });
    const validation = MoodModel.CONSTRAINTS.validate(model);

    if (validation.error) {
      return res.status(400).json({
        errors: validation.error.details.map(({ message, type, context }) => ({
          code: type,
          title: message,
          meta: context,
        })),
      });
    }

    const mood = await req.moodService.create(model);
    req.log.info(req.app.locals.storageMock);
    return res.json({
      data: {
        type: 'mood',
        id: mood.id,
        attributes: mood,
      },
    });
  } catch (error) {
    req.log.error('Creating of mood failed', error);
    return res.status(error.status || 500).json({
      errors: [{
        status: error.status || 500,
        title: error.message,
      }],
    });
  }
});

/**
 * @swagger
 * /:
 *  put:
 *    security:
 *      - apiKeyAuthorization: []
 *    tags:
 *      - mood
 *    summary: Create or update existing mood (check for existing matches)
 *    description: |
 *      If moodId is provided it will update the existing record (basic update) or throw error if mood does not exist.
 *      If moodId is not provided the API tries to match the record to any existing mood based on attributes.
 *      If a match is found and is above the required minimum points the API will update the mood,
 *      otherwise will create a new mood.
 *    parameters:
 *      - name: body
 *        in: body
 *        description: mood values
 *        required: true
 *        schema:
 *          $ref: '#/definitions/mood'
 *    responses:
 *      204:
 *        description: mood created
 *      400:
 *        description: The request was rejected - validation failed
 *      500:
 *        description: Internal server error
 */
router.put('/', async (req, res) => {
  try {
    const model = new MoodModel({ id: req.body.id, name: req.body.name });
    const validation = MoodModel.CONSTRAINTS.validate(model);

    if (validation.error) {
      return res.status(400).json({
        errors: validation.error.details.map(({ message, type, context }) => ({
          code: type,
          title: message,
          meta: context,
        })),
      });
    }

    const mood = await req.moodService.update(model);
    return res.json({
      data: {
        type: 'mood',
        id: mood.id,
        attributes: mood,
      },
    });
  } catch (error) {
    req.log.error('mood update failed', error);
    return res.status(error.status || 500).json({
      errors: [{
        status: error.status || 500,
        title: error.message,
      }],
    });
  }
});

export default router;
