/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
	root: true,
	extends: [require.resolve('@blgc/config/eslint/library')],
	ignorePatterns: ['src/__tests__/*']
};
