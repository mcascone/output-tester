import { getconfigdata, extractOutputs, updateConfigFromExtracts } from './main';
import * as core from '@actions/core';
const fs = require('fs');
const path = require('path');

jest.mock('@actions/core');

describe('getconfigdata', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // read mock-data.json into the CONFIG_DATA environment variable
    const mockDataPath = path.join(__dirname, 'mock-configdata.json');
    const mockData = fs.readFileSync(mockDataPath, 'utf8');
    process.env['CONFIG_DATA'] = mockData;

    (core.getInput as jest.Mock).mockReturnValue(JSON.stringify({
      action1: {
        outputs: { 'config.build.JAVA': 'tester' },
        conclusion: 'success',
        outcome: 'success'
      },
      action2: {
        outputs: { 'other-output': 'ignore' },
        conclusion: 'success',
        outcome: 'success'
      }
    }));
  });

  it('should update config data and set the output', async () => {
    await getconfigdata();

    expect(core.debug).toHaveBeenCalledWith('Extracted outputs: [{"config.build.JAVA":"tester"}]');
    expect(core.info).toHaveBeenCalledWith('Config data updated: config.build.JAVA');
    expect(core.setOutput).toHaveBeenCalledWith('config_output', expect.objectContaining({
      build: expect.objectContaining({
        JAVA: expect.stringContaining('tester')
      })
    }));  
  });
});

describe('extractOutputs', () => {
  it('should extract outputs that start with "config."', () => {
    const input = {
      action1: {
        outputs: { 'config.build.JAVA': 'test-app' },
        conclusion: 'success',
        outcome: 'success'
      }
    };

    const result = extractOutputs(input);

    expect(result).toEqual([{ 'config.build.JAVA': 'test-app' }]);
  });

  it('should ignore outputs that do not start with "config."', () => {
    const input = {
      action1: {
        outputs: { 'other.output': 'ignore' },
        conclusion: 'success',
        outcome: 'success'
      }
    };

    const result = extractOutputs(input);

    expect(result).toEqual([]);
  });

  it('should handle multiple outputs in one step', () => {
    const input = {
      action1: {
        outputs: {
          'config.build.JAVA': 'test-app',
          'config.app.version': '1.0.0'
        },
        conclusion: 'success',
        outcome: 'success'
      }
    };

    const result = extractOutputs(input);

    expect(result).toEqual([
      { 'config.build.JAVA': 'test-app', 'config.app.version': '1.0.0' }
    ]);
  });

  it('should handle outputs in multiple steps', () => {
    const input = {
      action1: {
        outputs: { 'config.build.JAVA': 'test-app' },
        conclusion: 'success',
        outcome: 'success'
      },
      step2: {
        outputs: { 'config.app.version': '1.0.0' },
        conclusion: 'success',
        outcome: 'success'
      }
    };

    const result = extractOutputs(input);

    expect(result).toEqual([
      { 'config.build.JAVA': 'test-app' },
      { 'config.app.version': '1.0.0' }
    ]);
  });

  it('should handle steps with multiple outputs that do and do not start with "config."', () => {  
    const input = {
      action1: {
        outputs: {
          'config.build.JAVA': 'test-app',
          'other.output': 'ignore'
        },
        conclusion: 'success',
        outcome: 'success'
      }
    };

    const result = extractOutputs(input);

    expect(result).toEqual([{ 'config.build.JAVA': 'test-app' }]);
  });

  it('should return an empty array if no outputs match', () => {
    const input = {
      action1: {
        outputs: { 'other.output': 'ignore' },
        conclusion: 'success',
        outcome: 'success'
      }
    };

    const result = extractOutputs(input);

    expect(result).toEqual([]);
  });
});

describe('updateConfigFromExtracts', () => {
  it('should add config data based on extracts', () => {
    const extracts = [{ 'config.build.JAVA': 'tester' }];
    const configData = { app: { name: 'test-app' } };

    updateConfigFromExtracts(extracts, configData);

    expect(configData).toEqual({ app: { name: 'test-app' }, build: { JAVA: 'tester' } });
  });

  it('should update nested keys correctly', () => {
    const extracts = [{ 'config.app.settings.theme': 'dark' }];
    const configData = { app: { settings: { theme: 'light' } } };

    updateConfigFromExtracts(extracts, configData);

    expect(configData).toEqual({ app: { settings: { theme: 'dark' } } });
  });

  it('should log an error for invalid keys', () => {
    const extracts = [{ 'config.': 'invalid' }];
    const configData = {};

    updateConfigFromExtracts(extracts, configData);

    expect(core.error).toHaveBeenCalledWith('Invalid key: config.');
  });
});