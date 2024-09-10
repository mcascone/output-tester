import * as core from '@actions/core';
import { getconfigdata, extractOutputs } from './main';

jest.mock('@actions/core');

describe('getconfigdata', () => {
  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should extract outputs and update config data', async () => {
    const mockStepData = {
      step1: {
        outputs: { out1: 'value1' },
        conclusion: 'success',
        outcome: 'success',
      },
      step2: {
        outputs: { out2: 'value2' },
        conclusion: 'success',
        outcome: 'success',
      },
    };

    const mockConfigData = {
      existingKey: 'existingValue',
    };

    (core.getInput as jest.Mock).mockReturnValue(JSON.stringify(mockStepData));
    (core.setOutput as jest.Mock).mockImplementation(() => {});
    process.env['CONFIG_DATA'] = JSON.stringify(mockConfigData);

    await getconfigdata();

    expect(core.getInput).toHaveBeenCalledWith('stepdata');
    expect(core.setOutput).toHaveBeenCalledWith('config_output', {
      existingKey: 'existingValue',
      "0": { out1: 'value1'},
      "1": { out2: 'value2'},
    });
  });

  it('should handle empty outputs gracefully', async () => {
    const mockStepData = {
      step1: {
        outputs: {},
        conclusion: 'success',
        outcome: 'success',
      },
    };

    const mockConfigData = {
      existingKey: 'existingValue',
    };

    (core.getInput as jest.Mock).mockReturnValue(JSON.stringify(mockStepData));
    process.env['CONFIG_DATA'] = JSON.stringify(mockConfigData);

    await getconfigdata();

    expect(core.getInput).toHaveBeenCalledWith('stepdata');
    expect(core.setOutput).toHaveBeenCalledWith('config_output', {
      existingKey: 'existingValue',
    });
  });

  it('should handle missing CONFIG_DATA gracefully', async () => {
    const mockStepData = {
      step1: {
        outputs: { out1: 'value1' },
        conclusion: 'success',
        outcome: 'success',
      },
    };

    (core.getInput as jest.Mock).mockReturnValue(JSON.stringify(mockStepData));
    process.env['CONFIG_DATA'] = undefined;

    await expect(getconfigdata()).rejects.toThrow(SyntaxError);
  });
});

describe('extractOutputs', () => {
  it('should extract non-empty outputs', () => {
    console.log(test);
    const mockStepData = {
      step1: {
        outputs: { out1: 'value1' },
        conclusion: 'success',
        outcome: 'success',
      },
      step2: {
        outputs: {},
        conclusion: 'success',
        outcome: 'success',
      },
    };

    const result = extractOutputs(mockStepData);
    expect(result).toEqual([{ out1: 'value1' }]);
  });

  it('should return an empty array if no outputs are present', () => {
    const mockStepData = {
      step1: {
        outputs: {},
        conclusion: 'success',
        outcome: 'success',
      },
    };

    const result = extractOutputs(mockStepData);
    expect(result).toEqual([]);
  });
});
