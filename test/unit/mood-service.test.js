import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import Mood from '../../src/domain/mood';
import MoodService from '../../src/services/mood-service';
import MoodModel from '../../src/domain/mood-model';
import Response404Exception from '../../src/exceptions/response-404-exception';

chai.use(chaiAsPromised);

describe('MoodService', () => {
  const createMood = options => new Mood(options);
  const createMoodModel = options => new MoodModel(options);
  const createService = options => new MoodService({
    moodRepo: {
      save: sinon.stub().resolves(),
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
      const service = createService();

      let result;

      before(async () => {
        result = await service.create(model);
      });

      it('should not call repository find() because ID is not provided', () =>
        expect(service.moodRepo.find).to.have.not.been.called);
      it('should call repository save() once', () =>
        expect(service.moodRepo.save).to.have.been.calledOnce);
      it('result should have value', () =>
        expect(result).to.be.not.null);
    });

    describe('creates Mood from a MoodModel with ID', () => {
      const model = createMoodModel({ id: '9f5075ef-bf2e-4960-a0ff-8fe50951d1e9', mood: 'Sad' });
      const service = createService();

      let result;

      before(async () => {
        service.moodRepo.find.returns(Promise.resolve());
        result = await service.create(model);
      });

      it('should call repository find() because ID is not provided', () =>
        expect(service.moodRepo.find).to.have.been.calledOnce);
      it('should call repository save() once', () =>
        expect(service.moodRepo.save).to.have.been.calledOnce);
      it('should return newly created mood with provided ID', () =>
        expect(result.id).to.equal(model.id));
      it('result should have value', () =>
        expect(result).to.be.not.null);
    });

    describe('finds a existing Mood for MoodModel ID', () => {
      const model = createMoodModel({ id: '111', mood: 'Sad' });
      const service = createService();

      before(async () => {
        service.moodRepo.find.returns(Promise.resolve(createMood({ id: '111', mood: 'Sad' })));
      });

      it('should throw exception because mood exists', () =>
        expect(service.create(model)).to.be.rejectedWith(Error, 'Mood already exists'));
    });

    describe('throws an Error if MoodModel is missing', () => {
      const service = createService();

      it('should throw exception because MoodModel is missing', () =>
        expect(service.create()).to.be.rejectedWith(Error, 'Mood model is required'));
    });
  });

  describe('update', () => {
    describe('updates Mood from a MoodModel', () => {
      const model = createMoodModel({ id: '7da92c68-a145-4942-932c-53f3d5e265c3', mood: 'Sad' });
      const service = createService();

      let result;

      before(async () => {
        service.moodRepo.find.returns(Promise.resolve(createMood({ id: '7da92c68-a145-4942-932c-53f3d5e265c3', mood: 'Sad' })));
        result = await service.update(model);
      });

      it('should call repository find() to lookup mood', () =>
        expect(service.moodRepo.find).to.have.been.calledOnce);
      it('should call repository update() once with the custoer', () =>
        expect(service.moodRepo.save).to.have.been.calledOnce);
      it('result should have value', () =>
        expect(result).to.be.not.null);
    });

    describe('does not find existing Mood for MoodModel ID', () => {
      const model = createMoodModel({ id: '7da92c68-a145-4942-932c-53f3d5e265c3', mood: 'Sad' });
      const service = createService();

      before(async () => {
        service.moodRepo.find.returns(Promise.resolve());
      });

      it('should throw exception because mood does not exist', () =>
        expect(service.update(model)).to.be.rejectedWith(Response404Exception, 'Mood not found'));
    });

    describe('throws an Error if MoodModel is missing', () => {
      const service = createService();

      it('should throw exception because MoodModel is missing', () =>
        expect(service.update()).to.be.rejectedWith(Error, 'Mood model is required'));
    });
  });
});
