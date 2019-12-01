module.exports = {
    "testRegex": "(/__(unit|integration)__/.*|(\\.|/)(test|it))\\.(jsx?|tsx?)$",
    "transform": {"^.+\\.tsx?$": "ts-jest"},
    "testPathIgnorePatterns": ["/dist/", "/node_modules/"],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
    "testEnvironment": 'node',
    "collectCoverage": true
}
