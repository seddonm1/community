import { describe, expect, it } from 'vitest';
import { booleanMiddleware, nonEmptyMiddleware, numberMiddleware } from './middlewares';

describe('middleware functions', () => {
	describe('booleanMiddleware', () => {
		it('should return undefined for undefined input', () => {
			expect(booleanMiddleware(undefined)).toBeUndefined();
		});

		it('should correctly parse true values', () => {
			const trueValues = ['true', 't', 'yes', 'on', '1'];
			trueValues.forEach((value) => {
				expect(booleanMiddleware(value)).toBe(true);
			});
		});

		it('should correctly parse false values', () => {
			const falseValues = ['false', 'f', 'no', 'off', '0'];
			falseValues.forEach((value) => {
				expect(booleanMiddleware(value)).toBe(false);
			});
		});

		it('should return undefined for invalid values', () => {
			expect(booleanMiddleware('invalid')).toBeUndefined();
		});

		it('should be case insensitive', () => {
			expect(booleanMiddleware('TRUE')).toBe(true);
			expect(booleanMiddleware('False')).toBe(false);
		});
	});

	describe('numberMiddleware', () => {
		it('should return undefined for undefined input', () => {
			expect(numberMiddleware(undefined)).toBeUndefined();
		});

		it('should correctly parse valid numbers', () => {
			expect(numberMiddleware('123')).toBe(123);
			expect(numberMiddleware('-123')).toBe(-123);
			expect(numberMiddleware('123.456')).toBe(123.456);
		});

		it('should return undefined for invalid numbers', () => {
			expect(numberMiddleware('not-a-number')).toBeUndefined();
			expect(numberMiddleware('')).toBeUndefined();
		});
	});

	describe('nonEmptyMiddleware', () => {
		it('should return undefined for undefined input', () => {
			expect(nonEmptyMiddleware(undefined)).toBe(undefined);
		});

		it('should return undefined for empty string', () => {
			expect(nonEmptyMiddleware('')).toBe(undefined);
		});

		it('should return undefined for whitespace-only string', () => {
			expect(nonEmptyMiddleware('   ')).toBe(undefined);
			expect(nonEmptyMiddleware('\t')).toBe(undefined);
			expect(nonEmptyMiddleware('\n')).toBe(undefined);
		});

		it('should return the original string for non-empty input', () => {
			expect(nonEmptyMiddleware('hello')).toBe('hello');
			expect(nonEmptyMiddleware('  hello  ')).toBe('  hello  ');
			expect(nonEmptyMiddleware('123')).toBe('123');
		});
	});
});
