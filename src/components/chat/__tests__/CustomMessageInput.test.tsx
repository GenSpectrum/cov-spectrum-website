import { render, screen } from '@testing-library/react';
import { CustomMessageInput } from '../CustomMessageInput';
import userEvent from '@testing-library/user-event';

const onMessageSendMock = jest.fn();

describe('CustomMessageInput', () => {
  const maxLength = 30;

  function renderCustomerMessageInput(args: { disabled: boolean } = { disabled: false }) {
    render(
      <CustomMessageInput disabled={args.disabled} maxLength={maxLength} onMessageSend={onMessageSendMock} />
    );
  }

  function getMessageInput() {
    // eslint-disable-next-line testing-library/no-node-access -- Alternative suggestions are welcome, I didn't find a way to use testing library tools
    return document.querySelector('div[contenteditable="true"],div[contenteditable="false"]')!;
  }

  async function typeMessage(message: string) {
    await userEvent.click(getMessageInput());
    await userEvent.type(getMessageInput(), message);
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should accept no input when disabled', async () => {
    renderCustomerMessageInput({ disabled: true });

    await typeMessage('my message');

    expect(getMessageInput()).toHaveTextContent('');
  });

  test('should display the typed input', async () => {
    renderCustomerMessageInput();

    await typeMessage('my message');

    expect(getMessageInput()).toHaveTextContent('my message');
  });

  test('should not allow more input than the max length permits', async () => {
    renderCustomerMessageInput();

    await typeMessage(`this is a very long message with more than ${maxLength} characters`);

    expect(getMessageInput()).toHaveTextContent('this is a very long message wi');
  });

  test('should send message when hitting enter', async () => {
    renderCustomerMessageInput();

    await typeMessage('my message{enter}');

    expect(getMessageInput()).toHaveTextContent('');
    expect(onMessageSendMock).toHaveBeenCalledWith('my message', undefined);
  });

  test('should send message when pressing send button', async () => {
    renderCustomerMessageInput();

    await typeMessage('my message');
    await userEvent.click(screen.getByPlaceholderText('Send'));

    expect(getMessageInput()).toHaveTextContent('');
    expect(onMessageSendMock).toHaveBeenCalledWith('my message', undefined);
  });

  async function sendMessages(firstMessage: string, secondMessage: string) {
    await typeMessage(firstMessage);
    await userEvent.click(screen.getByPlaceholderText('Send'));
    expect(onMessageSendMock).toHaveBeenCalledWith(firstMessage, undefined);

    await typeMessage(secondMessage);
    await userEvent.click(screen.getByPlaceholderText('Send'));
    expect(onMessageSendMock).toHaveBeenCalledWith(secondMessage, undefined);
  }

  test('should scroll through prompt history when pressing arrow up and down', async () => {
    let firstMessage = 'first message';
    let secondMessage = 'second message';

    renderCustomerMessageInput();

    await sendMessages(firstMessage, secondMessage);

    await userEvent.click(getMessageInput());
    expect(getMessageInput()).toHaveTextContent('');
    expect(getMessageInput()).toHaveFocus();

    await userEvent.keyboard('{arrowup}');
    expect(getMessageInput()).toHaveTextContent(secondMessage);

    await userEvent.keyboard('{arrowdown}');
    expect(getMessageInput()).toHaveTextContent('');

    await userEvent.keyboard('{arrowdown}');
    expect(getMessageInput()).toHaveTextContent('');

    await userEvent.keyboard('{arrowup}');
    expect(getMessageInput()).toHaveTextContent(secondMessage);

    await userEvent.keyboard('{arrowup}');
    expect(getMessageInput()).toHaveTextContent(firstMessage);

    await userEvent.keyboard('{arrowup}');
    expect(getMessageInput()).toHaveTextContent(firstMessage);

    await userEvent.keyboard('{arrowdown}');
    expect(getMessageInput()).toHaveTextContent(secondMessage);
  });

  test('should stop scrolling through prompt history when editing a prompt after selecting it from the history', async () => {
    let firstMessage = 'first message';
    let secondMessage = 'second message';

    renderCustomerMessageInput();

    await sendMessages(firstMessage, secondMessage);
    await userEvent.click(getMessageInput());

    await userEvent.keyboard('{arrowup}');
    expect(getMessageInput()).toHaveTextContent(secondMessage);

    await userEvent.keyboard('{end} and more text');
    let expectedTextAfterTyping = `${secondMessage} and more text`;
    expect(getMessageInput()).toHaveTextContent(expectedTextAfterTyping);

    await userEvent.keyboard('{arrowup}');
    expect(getMessageInput()).toHaveTextContent(expectedTextAfterTyping);

    await userEvent.keyboard('{arrowdown}');
    expect(getMessageInput()).toHaveTextContent(expectedTextAfterTyping);
  });
});
