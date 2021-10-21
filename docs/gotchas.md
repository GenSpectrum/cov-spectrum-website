# Gotchas

This is a short list of things that can easily cause bugs if you forget them.

## Changing widget props

Since widget props are encoded in embed URLs, adding props (or changing their names or types) can break existing embed URLs. Changing the name of a widget will also break URLs. You should generally only add optional props once a widget is widely shared. See [./widgets.md](./widgets.md) for more about their props.

## Widgets must be registered

You must add every new widget in [src/widgets/index.tsx](/src/widgets/index.tsx). If you forget to do that, everything will seem to work, but embed URLs wil be broken. See [./widgets.md](./widgets.md).
