import { deEscapeValueName, escapeValueName } from '../RechartsKeyConversion';

describe('escapeValueName', function () {
  it('should replace all dots with double underscores', function () {
    expect(escapeValueName('a.b.c')).toEqual('a__b__c');
  });
});

describe('deEscapeValueName', function () {
  it('should replace all double underscores with dots', function () {
    expect(deEscapeValueName('a__b__c')).toEqual('a.b.c');
  });
});
