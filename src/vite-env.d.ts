/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare namespace vi {
  type Mock<T = any> = any;
}

declare var IS_REACT_ACT_ENVIRONMENT: boolean;
