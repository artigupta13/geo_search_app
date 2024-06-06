// __mocks__/ioredis.js
const mGet = jest.fn();
const mSetex = jest.fn();

const Redis = jest.fn().mockImplementation(() => ({
  get: mGet,
  setex: mSetex,
  on: jest.fn(),
}));

export default Redis;
export { mGet, mSetex };
