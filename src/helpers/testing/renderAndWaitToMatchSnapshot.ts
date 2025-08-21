import renderer, { ReactTestRendererJSON } from 'react-test-renderer';
import { act, waitFor } from '@testing-library/react';
import { maskUuid } from './snapshot-tests-masking';
import { ReactElement } from 'react';

export async function renderAndWaitToMatchSnapshot(
  element: ReactElement,
  preSnapshotTransform?: (renderedJson: null | ReactTestRendererJSON | ReactTestRendererJSON[]) => void
): Promise<void> {
  const reactTestRenderer = renderer.create(element);

  await waitFor(async () => {
    expect(reactTestRenderer.toJSON()).not.toBeNull();
  });
  await act(async () => {});
  await act(async () => {});

  const renderedJson = reactTestRenderer.toJSON();
  maskUuid(renderedJson);
  preSnapshotTransform?.(renderedJson);
  expect(renderedJson).toMatchSnapshot();
}
