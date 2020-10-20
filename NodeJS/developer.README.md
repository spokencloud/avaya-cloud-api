# The Node.js API for the Avaya Public Cloud

Before using the API, please contact Avaya for API key and endpoint information.

## Build the project

To build the API, you need npm and node.js installed.

- `npm install`
- `npm run compile`
- `npm run unit` to run all unit tests

To ensure code quality, you could install VSCode plugins including

- Coverage Gutters 2.4.2, see coverage in editor
- Jest, run tests in watch mode
- Prettier - Code formatter, to format code on save
- TSLint, fix Typescript on save

Git Hooks: The project also uses husky, lint-staged, and prettier to make sure code is formatted and tested before being committed to Git repository. Make sure latest version of npm is used for this work. e.g. nvm use 13.5

- pre-commit, compile and format code
- pre-push, run unit tests
