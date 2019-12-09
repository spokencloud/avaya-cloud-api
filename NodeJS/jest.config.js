module.exports = {
    "testRegex": "(/__(unit|integration)__/.*|(\\.|/)(test|it))\\.(jsx?|tsx?)$",
    "transform": {"^.+\\.tsx?$": "ts-jest"},
    "testPathIgnorePatterns": ["/lib/", "/node_modules/"],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
    "testEnvironment": 'node',
    "collectCoverage": true // set it to false when debug via --coverage in launch.json, otherwise it messes up source map
}
