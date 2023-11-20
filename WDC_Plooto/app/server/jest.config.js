// jest.config.js

/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['./jest.setup.ts'],
	verbose: true,
	testSequencer: './jest.sequence.js'
};
