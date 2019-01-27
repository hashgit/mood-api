import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import MoodService from '../../src/services/mood-service';
import MoodModel from '../../src/domain/mood-model';
import Response404Exception from '../../src/exceptions/response-404-exception';

chai.use(chaiAsPromised);

describe('MoodService', () => {
  const createMoodModel = options => new MoodModel(options);
  const createService = (options, saves) => new MoodService({
    moodRepo: {
      save: sinon.stub().resolves(saves),
      update: sinon.stub().resolves(saves),
      find: sinon.stub(),
    },
    log: {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
    },
    ...options,
  });

  describe('create', () => {
    describe('creates Mood from a MoodModel without ID', () => {
      const model = createMoodModel({ mood: 'Sad' });
      const service = createService({}, true);

      let result;

      before(async () => {
        result = await service.create(model);
      });

      it('should call repository save() once', () =>
        expect(service.moodRepo.save).to.have.been.calledOnce);
      it('result should have value', () =>
        expect(result).to.be.not.null);
    });

    describe('creates Mood from a MoodModel with ID', () => {
      const model = createMoodModel({ id: '9f5075ef-bf2e-4960-a0ff-8fe50951d1e9', mood: 'Sad' });
      const service = createService({}, true);

      let result;

      before(async () => {
        result = await service.create(model);
      });

      it('should call repository save() once', () =>
        expect(service.moodRepo.save).to.have.been.calledOnce);
      it('should return newly created mood with provided ID', () =>
        expect(result.id).to.equal(model.id));
      it('result should have value', () =>
        expect(result).to.be.not.null);
    });

    describe('throws Error if fails to create mood', () => {
      const model = createMoodModel({ id: '9f5075ef-bf2e-4960-a0ff-8fe50951d1e9', mood: 'Sad' });
      const service = createService({}, false);

      it('should throw exception because save failed', () =>
        expect(service.create(model)).to.be.rejectedWith(Error, 'Failed to create mood object'));

      it('should call repository save() once', () =>
        expect(service.moodRepo.save).to.have.been.calledOnce);
    });

    describe('throws an Error if MoodModel is missing', () => {
      const service = createService();

      it('should throw exception because MoodModel is missing', () =>
        expect(service.create()).to.be.rejectedWith(Error, 'Mood model is required'));
    });

    describe('throws an Error if MoodModel is invalid', () => {
      const service = createService();
      const model = { timestamp: new Date().toISOString() }; // required field mood is missing
      it('should throw exception because MoodModel is missing', () =>
        expect(service.create(model)).to.be.rejectedWith(Error));
    });
  });

  describe('update', () => {
    describe('updates Mood from a MoodModel', () => {
      const model = createMoodModel({ id: '7da92c68-a145-4942-932c-53f3d5e265c3', note: 'Anything' });
      const service = createService({}, true);

      let result;

      before(async () => {
        result = await service.update(model);
      });

      it('should call repository update() once with the new value', () =>
        expect(service.moodRepo.update).to.have.been.calledOnce);
      it('result should be true', () =>
        expect(result).to.be.true);
    });

    describe('does not find existing Mood for MoodModel ID', () => {
      const model = createMoodModel({ id: '7da92c68-a145-4942-932c-53f3d5e265c3', note: 'Anything' });
      const service = createService({}, false);

      it('should throw exception because mood does not exist', () =>
        expect(service.update(model)).to.be.rejectedWith(Response404Exception));
    });

    describe('throws an Error if MoodModel is missing', () => {
      const service = createService();

      it('should throw exception because MoodModel is missing', () =>
        expect(service.update()).to.be.rejectedWith(Error, 'Mood model is required'));
    });
  });

  describe('getAll', () => {
    describe('filters database records', () => {
      const dbItems = [
        {
          id: '1',
          mood: 'Good',
          note: 'anything',
          timestamp: (new Date()).toString(),
          invalidProp: 'here',
        },
      ];
      const service = createService({
        moodRepo: {
          getAll: sinon.stub().resolves(dbItems),
        },
      });

      let items;
      before(async () => {
        items = await service.getAll();
      });

      it('should get all records', () => expect(items.length).to.be.equal(1));
      it('item has 4 properties', () => expect(Object.getOwnPropertyNames(items[0]).length).to.be.equal(4));
      it('item does not have invalidProp', () => expect(items[0].invalidProp).to.be.undefined);
    });
  });

  describe('find', () => {
    describe('will get the item returned by repo', () => {
      const dbItem = {
        id: 'a', timestamp: new Date().toISOString(), note: 'something', mood: 'Good',
      };
      const service = createService({
        moodRepo: {
          find: sinon.stub().resolves(dbItem),
        },
      });

      let item;
      before(async () => {
        item = await service.find('some');
      });

      it('item is not null', () =>
        expect(item).to.be.not.null);
      it('item has same id as in repo', () => {
        expect(item.id).to.be.equal(dbItem.id);
      });
    });

    describe('when item is not found', () => {
      const service = createService({
        moodRepo: {
          find: sinon.stub().resolves(),
        },
      });

      it('find throws exception', () =>
        expect(service.find('id')).to.be.rejectedWith(Response404Exception, 'Mood not found'));
    });
  });
});
