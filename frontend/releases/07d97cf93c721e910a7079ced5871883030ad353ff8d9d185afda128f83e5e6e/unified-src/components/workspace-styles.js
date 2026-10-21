import { css } from "lit";
import { componentStyles } from "./component-styles.js";
export const workspaceStyles = css`
  :host {
    display: block;
    height: 100%;
    overflow: auto;
    overscroll-behavior: contain;
  }
  section {
    padding: 24px;
    max-width: 1000px;
    margin: auto;
  }
  h2 {
    margin: 0 0 20px;
    font-size: clamp(22px, 3vw, 28px);
    line-height: 1.25;
    letter-spacing: -0.02em;
  }
  h3 {
    font-size: var(--rm-font-size-base, 16px);
  }
  nav,
  .toolbar,
  .row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  button,
  select,
  input,
  textarea {
    font: inherit;
    color: inherit;
    background: var(--rm-bg-surface, white);
    border: 1px solid var(--rm-border-strong, var(--rm-border, #a6bbc4));
    border-radius: 12px;
    padding: 10px 14px;
    min-height: 44px;
  }
  button {
    cursor: pointer;
    font-weight: 600;
  }
  button:hover,
  button.active {
    background: var(--rm-accent-soft, #dce9f0);
    color: var(--rm-accent-ink, var(--rm-text));
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 12px 0;
  }
  input,
  textarea,
  select {
    max-width: 100%;
    box-sizing: border-box;
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 20px;
    width: 20px;
    height: 20px;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-height: 340px;
    overflow: auto;
  }
  .record {
    padding: 14px;
    background: var(--rm-bg-surface, white);
    border: 1px solid var(--rm-border, #ddd);
    border-radius: var(--rm-radius, 16px);
    margin: 8px 0;
  }
  .muted {
    color: var(--rm-text-secondary, #666);
  }
  .row strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .checked strong {
    text-decoration: line-through;
  }
  form {
    max-width: 720px;
  }
  .danger {
    color: var(--rm-error-ink, #983d25);
  }
  @media (max-width: 600px) {
    section {
      padding: 12px;
    }
    nav {
      gap: 4px;
    }
    nav button {
      padding: 8px 12px;
      font-size: var(--rm-font-size-sm, 14px);
    }
  }
  ${componentStyles}
`;
