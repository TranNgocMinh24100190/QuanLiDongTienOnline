import "@testing-library/jest-dom";

const originalWarn = console.warn;

beforeAll(() => {
  console.warn = (...args) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (
      message.includes("React Router Future Flag Warning") ||
      message.includes("Relative route resolution within Splat routes is changing in v7")
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});