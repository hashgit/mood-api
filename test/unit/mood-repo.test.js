import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import moment from 'moment';

import MoodRepo from '../../src/repos/mood-repo';

chai.use(chaiAsPromised);

describe('MoodRepo', () => {
  const createRepo = options => new MoodRepo({
    dbClient: {
      connect: sinon.stub(),
    },
    log: {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
    },
    ...options,
  });

  describe('find', () => {
    describe('returns item received by mongodb provider', () => {
      const repo = createRepo();
      const item = { id: '1', mood: 'Happy' };
      repo.execute = sinon.stub().resolves(item);

      let result;
      before(async () => {
        result = await repo.find('id');
      });

      it('result is item', () =>
        expect(result).to.be.not.undefined);
      it('result is equal to item', () =>
        expect(result).to.be.equal(item));
    });
  });

  describe('getAll', () => {
    describe('when no query provided', () => {
      const find = sinon.stub().returns({ toArray: sinon.stub() });
      const db = { collection: sinon.stub().returns({ find }) };
      const client = { db: sinon.stub().returns(db), close: sinon.stub() };
      const repo = createRepo({
        dbClient: {
          connect: sinon.stub().resolves(client),
        },
      });

      before(async () => {
        await repo.getAll({});
      });

      it('find query is empty', () =>
        expect(find).calledWith({}));
    });

    describe('when both query arguments provided', () => {
      const find = sinon.stub().returns({ toArray: sinon.stub() });
      const db = { collection: sinon.stub().returns({ find }) };
      const client = { db: sinon.stub().returns(db), close: sinon.stub() };
      const repo = createRepo({
        dbClient: {
          connect: sinon.stub().resolves(client),
        },
      });

      const startDate = new Date().toUTCString();
      const endDate = new Date().toUTCString();
      before(async () => {
        await repo.getAll({ startDate, endDate });
      });

      it('find query is empty', () =>
        expect(find).calledWith({ timestamp: { $gte: moment.utc(startDate).format(), $lte: moment.utc(endDate).format() } }));
    });
  });

  describe('update', () => {
    describe('cannot update without mood model', () => {
      const repo = createRepo();
      it('should throw exception because model is undefined', () =>
        expect(repo.update()).to.be.rejectedWith(Error, 'Mood is required'));
    });

    describe('ID in mood model required', () => {
      const repo = createRepo();
      it('should throw exception because model does not have ID', () =>
        expect(repo.update({ })).to.be.rejectedWith(Error, 'Mood ID is required'));
    });

    describe('successfully updates', () => {
      const repo = createRepo();
      repo.execute = sinon.stub().resolves({ modifiedCount: 1 });

      let result;
      before(async () => {
        result = await repo.update({ id: '1', note: 'anything' });
      });

      it('result is true', () =>
        expect(result).to.be.true);
    });
  });

  describe('save', () => {
    describe('cannot save without mood model', () => {
      const repo = createRepo();
      it('should throw exception because model is undefined', () =>
        expect(repo.save()).to.be.rejectedWith(Error, 'Mood is required'));
    });

    describe('ID in mood model required', () => {
      const repo = createRepo();
      it('should throw exception because model does not have ID', () =>
        expect(repo.save({ })).to.be.rejectedWith(Error, 'Mood ID is required'));
    });

    describe('successfully saves', () => {
      const repo = createRepo();
      repo.execute = sinon.stub().resolves({ insertedCount: 1 });

      let result;
      before(async () => {
        result = await repo.save({ id: '1', note: 'anything' });
      });

      it('result is true', () =>
        expect(result).to.be.true);
    });
  });

  describe('execute', () => {
    describe('success', () => {
      const db = {};
      const client = { db: sinon.stub().returns(db), close: sinon.stub() };
      const repo = createRepo({
        dbClient: {
          connect: sinon.stub().resolves(client),
        },
      });

      let result;
      before(async () => {
        result = await repo.execute(() => {});
      });

      it('result is not null', () =>
        expect(result).to.not.be.null);
      it('invokes connect', () =>
        expect(repo.mongoClient.connect).to.have.been.calledOnce);
      it('invokes close', () =>
        expect(client.close).to.have.been.calledOnce);
      it('there was no error', () =>
        expect(repo.log.error).to.have.not.been.called);
    });

    describe('dbCommand throws error', () => {
      const db = {};
      const client = { db: sinon.stub().returns(db), close: sinon.stub() };
      const repo = createRepo({
        dbClient: {
          connect: sinon.stub().resolves(client),
        },
      });

      it('should throw exception because command failed', () =>
        expect(repo.execute(() => { throw new Error('command error'); })).to.be.rejectedWith(Error, 'command error'));
      it('invokes connect', () =>
        expect(repo.mongoClient.connect).to.have.been.calledOnce);
      it('invokes close', () =>
        expect(client.close).to.have.been.calledOnce);
      it('there was an error', () =>
        expect(repo.log.error).to.have.been.calledOnce);
    });

    describe('dbCommand throws error because mood already exists', () => {
      const db = {};
      const client = { db: sinon.stub().returns(db), close: sinon.stub() };
      const repo = createRepo({
        dbClient: {
          connect: sinon.stub().resolves(client),
        },
      });

      const error = new Error('command error');
      error.code = 11000;

      it('should throw exception because command failed', () =>
        expect(repo.execute(() => { throw error; })).to.be.rejectedWith(Error, 'Mood already exists'));
      it('invokes connect', () =>
        expect(repo.mongoClient.connect).to.have.been.calledOnce);
      it('invokes close', () =>
        expect(client.close).to.have.been.calledOnce);
      it('there was an error', () =>
        expect(repo.log.error).to.have.been.calledOnce);
    });

    describe('failed to connect to mongodb', () => {
      const db = {};
      const client = { db: sinon.stub().returns(db), close: sinon.stub() };
      const repo = createRepo({
        dbClient: {
          connect: sinon.stub().throws('connect', 'Failed'),
        },
      });

      const error = new Error('command error');
      error.code = 11000;

      it('should throw exception because command failed', () =>
        expect(repo.execute(() => { })).to.be.rejectedWith(Error, 'Failed'));
      it('invokes connect', () =>
        expect(repo.mongoClient.connect).to.have.been.calledOnce);
      it('not invokes close', () =>
        expect(client.close).to.not.have.been.calledOnce);
      it('there was an error', () =>
        expect(repo.log.error).to.have.been.calledOnce);
    });
  });
});
