# Tests

We currently have two types of tests: snapshot tests for the more-or-less pure React components (especially the charts) and unit tests for the algorithmically more complex parts. The tests are stored in `__tests__` folders and have the file ending `.test.ts(x)`.

## Snapshot tests

Snapshot testing is a regression test technique which compares the output of the current code with the output of a previous version. We use "react-test-renderer" to render React components and store the snapshots in `__tests__/__snapshots__` folders. The purpose of the tests is to help us identify the components impacted by a change.

When changing a component, a new snapshot needs to be created. This can be done either with `jest --update` or by running `npm run test` and then pressing `u`. Please read the [Jest documentation](https://jestjs.io/docs/snapshot-testing) for further information.

For snapshot tests to work, the tested component needs to be deterministic, i.e., the rendered output must always be the same given the same input. This is not the case for all the libraries we use. To mitigate the problem, we have to determine the non-deterministic parts of the output (e.g., this could be randomly generated CSS class names) and mask them. See [`snapshot-tests-masking.ts`](../src/helpers/testing/snapshot-tests-masking.ts).

The tests are run headlessly, but some components require information about the view. For example, they observe the window width through `useResizeDetector()`. We have to mock it.
