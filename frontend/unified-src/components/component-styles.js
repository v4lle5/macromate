import { css } from "lit";

// Shared by the shadow roots: browser defaults do not inherit card typography.
export const componentStyles = css`
  :host {
    min-width: 0;
    min-height: 0;
    color: var(--rm-text, #243c42);
    color-scheme: inherit;
    font-family: var(
      --rm-font-family,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif
    );
    font-size: var(--rm-font-size-base, 15px);
    line-height: var(--rm-line-height, 1.55);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
    line-height: 1.4;
    letter-spacing: inherit;
  }

  input,
  select,
  textarea {
    min-width: 0;
    max-width: 100%;
    accent-color: var(--rm-accent, #315d75);
    color-scheme: inherit;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--rm-text-secondary, #506770);
    opacity: 1;
  }

  select option {
    color: var(--rm-text, #243c42);
    background: var(--rm-dialog-bg, #f3f7f8);
  }

  :host :is(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--rm-focus, var(--rm-accent, #315d75));
    outline-offset: 2px;
  }

  :host button:disabled {
    color: var(--rm-disabled-text, var(--rm-text-secondary, #506770));
    background: var(--rm-disabled-bg, var(--rm-bg-elevated, #e4ecef));
    opacity: 1;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;
