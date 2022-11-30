// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import setupDayjs from './helpers/dayjsSetup';

setupDayjs();

global.fetch = jest
  .fn()
  .mockImplementation((...args) =>
    Promise.reject(
      'Make sure to not issue api calls in unit tests, ' +
        "maybe you need to explicitly use the manual jest mocks in your test (jest.mock('../../../data/api');)?" +
        ' Args were: ' +
        JSON.stringify(args)
    )
  );
