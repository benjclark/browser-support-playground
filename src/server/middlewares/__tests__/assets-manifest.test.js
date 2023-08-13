jest.mock('fs');
jest.mock('../../logger');

const {assetsManifest} = require('../assets-manifest');

describe('Assets manifest middleware', () => {
	const options = {
		manifestFile: 'manifest-file.json',
		readManifestPerRequest: false
	};

	const fakeManifest = {
		field1: 'value1',
		field2: 'value2'
	};

	let fs;
	let next;

	beforeEach(() => {
		next = jest.fn();
		fs = require('fs');
	});

	afterEach(() => {
		fs.readFileSync.mockReset();
	});

	describe('with readManifestPerRequest off', () => {
		describe('initialisation', () => {
			let middleware;

			beforeEach(() => {
				fs.readFileSync.mockReturnValueOnce(JSON.stringify(fakeManifest));

				middleware = assetsManifest(options);
			});

			test('reads the manifest and returns a middleware function', () => {
				expect(middleware).toBeInstanceOf(Function);
				expect(fs.readFileSync).toHaveBeenCalledWith(options.manifestFile, 'utf8');
			});

			test('returns a middleware that adds the manifest to the locals', () => {
				const response = {
					locals: {}
				};

				middleware(undefined, response, next);

				expect(next).toHaveBeenCalledTimes(1);
				expect(response.locals.assets).toEqual(fakeManifest);
			});
		});

		test('throws an error if the file can not be read', () => {
			fs.readFileSync.mockReturnValueOnce('not valid json');

			expect(() => assetsManifest(options)).toThrowError('Could not load asset manifest file, or file was not valid JSON');
		});
	});

	describe('with readManifestPerRequest on', () => {
		const optionsOn = {
			...options,
			readManifestPerRequest: true
		};

		let middleware;
		let response;

		beforeEach(() => {
			response = {
				locals: {}
			};
			middleware = assetsManifest(optionsOn);
		});

		test('returns a middleware without reading the manifest', () => {
			expect(middleware).toBeInstanceOf(Function);
			expect(fs.readFileSync).not.toHaveBeenCalled();
		});

		test('middleware reads the manifest and adds it to the locals', () => {
			fs.readFileSync.mockReturnValueOnce(JSON.stringify(fakeManifest));

			middleware(undefined, response, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(fs.readFileSync).toHaveBeenCalledWith(options.manifestFile, 'utf8');
			expect(response.locals.assets).toEqual(fakeManifest);
		});

		test(`middleware defaults to an empty object if the manifest can't be read`, () => {
			fs.readFileSync.mockReturnValueOnce('not valid json!');

			middleware(undefined, response, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(response.locals.assets).toEqual({});
		});
	});
});
