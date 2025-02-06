const { Client } = require('pg');
const { createDatabase } = require('../config/config');
const logger = require('../config/logger');

jest.mock('pg');
jest.mock('../config/logger');

describe('Config Tests', () => {
  let clientMock;

  beforeEach(() => {
    clientMock = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    Client.mockImplementation(() => clientMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDatabase', () => {
    it('should create the database if it does not exist', async () => {
      clientMock.query.mockResolvedValueOnce({ rowCount: 0 });

      await createDatabase();

      expect(clientMock.connect).toHaveBeenCalled();
      expect(clientMock.query).toHaveBeenCalledWith(expect.stringContaining('SELECT 1'), [expect.any(String)]);
      expect(clientMock.query).toHaveBeenCalledWith(expect.stringContaining('CREATE DATABASE'), [expect.any(String)]);
      expect(clientMock.end).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should not create the database if it already exists', async () => {
      clientMock.query.mockResolvedValueOnce({ rowCount: 1 });

      await createDatabase();

      expect(clientMock.connect).toHaveBeenCalled();
      expect(clientMock.query).toHaveBeenCalledWith(expect.stringContaining('SELECT 1'), [expect.any(String)]);
      expect(clientMock.query).not.toHaveBeenCalledWith(expect.stringContaining('CREATE DATABASE'), [expect.any(String)]);
      expect(clientMock.end).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error if there is an issue creating the database', async () => {
      const error = new Error('Database error');
      clientMock.query.mockRejectedValueOnce(error);

      await createDatabase();

      expect(clientMock.connect).toHaveBeenCalled();
      expect(clientMock.query).toHaveBeenCalledWith(expect.stringContaining('SELECT 1'), [expect.any(String)]);
      expect(clientMock.end).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Error creating database:', error.stack);
    });
  });
});
