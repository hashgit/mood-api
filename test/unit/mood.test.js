import { expect } from 'chai';

import Mood from '../../src/domain/mood';

describe('Mood', () => {
  describe('Constraints', () => {
    it('Valid mood should not produce errors', () =>
      expect(Mood.CONSTRAINTS.validate(new Mood({ mood: 'Sad' })).error).to.be.null);

    it('Invalid mood should produce errors', () =>
      expect(Mood.CONSTRAINTS.validate(new Mood({ id: 'undefined' })).error).to.exist);
  });

  describe('toJSON', () => {
    it('should return all own properties and attributes', () => {
      const moodJson = new Mood({
        moon: 'Imad',
      }).toJSON();

      expect(moodJson).to.have.property('id');
      expect(moodJson).to.have.property('mood');
    });
  });
});
