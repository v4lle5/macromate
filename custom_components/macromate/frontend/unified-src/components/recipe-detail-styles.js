import { css } from "lit";
import { componentStyles } from "./component-styles.js";

export const recipeDetailStyles = css`
  :host {
    display: block;
    height: 100%;
  }

  .detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  /* Wide two-column layout */
  .detail-container.wide {
    flex-direction: row;
  }
  .detail-left {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--rm-border);
    overflow: hidden;
  }
  .detail-left .hero-img {
    height: 240px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    background: var(--rm-bg-elevated);
  }
  .detail-left .hero-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .detail-left .hero-img .hero-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
  }
  .detail-left .hero-img .hero-placeholder ha-icon {
    --mdc-icon-size: 64px;
    opacity: 0.3;
  }
  .detail-left-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 16px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border) transparent;
  }
  .detail-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .detail-right-header {
    padding: 16px 16px 0;
    flex-shrink: 0;
  }
  .detail-right-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px 16px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border) transparent;
  }
  .notes-section {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid var(--rm-border);
  }
  .notes-section h3 {
    margin: 0 0 8px;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rm-text-secondary);
  }

  /* Recipe title */
  .recipe-title {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 700;
    color: var(--rm-text);
    line-height: 1.2;
  }
  .recipe-title.wide-centered {
    text-align: center;
    font-size: 22px;
  }
  .detail-desc.wide-centered {
    text-align: center;
  }
  .detail-right-header .quick-rating {
    justify-content: center;
  }
  .detail-right-header .action-btns-row {
    justify-content: center;
  }

  /* Quick rating */
  .quick-rating {
    display: flex;
    gap: 2px;
    margin: 0 0 8px;
  }
  .qr-star {
    font-size: 20px;
    cursor: pointer;
    color: var(--rm-border);
    -webkit-text-stroke: 1px rgba(200, 150, 0, 0.4);
    transition: color 0.15s;
  }
  .qr-star.filled {
    color: #f5a623;
    -webkit-text-stroke: 1px #c47f0a;
  }
  .qr-star:hover {
    color: #f5a623;
  }

  /* Action buttons row */
  .action-btns-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin: 6px 0 10px;
    justify-content: center;
  }
  .action-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rm-text-secondary);
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    transition: color 0.15s;
    text-decoration: none;
    width: 56px;
  }
  .action-icon-btn .btn-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .action-icon-btn ha-icon {
    --mdc-icon-size: 22px;
  }
  .action-icon-btn:hover .btn-icon {
    background: var(--rm-accent-soft);
  }
  .action-icon-btn:hover {
    color: var(--rm-accent, #ff6b35);
  }
  .action-icon-btn.fav-active .btn-icon {
    background: var(--rm-error-soft, #f6e5df);
  }
  .action-icon-btn.fav-active {
    color: var(--rm-error, #983d25);
  }
  .action-icon-btn.danger .btn-icon {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }
  .action-icon-btn.danger {
    color: var(--rm-error, #983d25);
  }

  /* Meta chips (wide layout) */
  .meta-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    justify-content: center;
  }
  .meta-chip-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary);
    font-weight: 600;
  }
  .meta-chip-icon ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Chip groups: column of rows, each row = label chip + value chips */
  .chips-area {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .chip-group-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .chip-label {
    background: var(--rm-bg-main);
    border: 1px solid var(--rm-border);
    color: var(--rm-text-secondary);
    font-weight: 600;
    cursor: default;
  }

  /* Hero */
  .hero {
    flex-shrink: 0;
    height: 180px;
    position: relative;
    background: var(--rm-bg-elevated, #2c2c2e);
    overflow: hidden;
  }
  .hero.no-image {
    height: 80px;
  }
  .hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
  .hero-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .hero-placeholder ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.4;
  }

  .hero-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
  }
  .hero-btn {
    background: rgba(0, 0, 0, 0.55);
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    transition:
      background 0.15s,
      color 0.15s;
    padding: 0;
  }
  .hero-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .hero-btn:hover {
    background: rgba(0, 0, 0, 0.75);
  }
  .hero-btn.fav-active {
    color: #ffb5c0;
  }
  .hero-btn.delete-btn.confirm {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }

  /* Scroll area */
  .detail-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border, rgba(255, 255, 255, 0.08)) transparent;
  }

  .detail-head {
    margin-bottom: 12px;
  }
  .detail-desc {
    margin: 0 0 8px;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    line-height: 1.5;
  }

  .meta-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--rm-bg-elevated, #2c2c2e);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 60px;
  }
  .meta-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .meta-val {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text, #e5e5ea);
  }

  .tags-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .tag-chip {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
    color: var(--rm-accent, #ff6b35);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: var(--rm-font-size-xs, 12px);
  }

  /* Chip groups (courses, categories, collections) */
  .chip-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }
  .chip-group-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .chip {
    border-radius: 20px;
    padding: 3px 10px;
    font-size: var(--rm-font-size-xs, 12px);
    border: none;
    cursor: default;
  }
  .chip-nav {
    cursor: pointer;
    transition:
      filter 0.15s,
      opacity 0.15s;
  }
  .chip-nav:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .chip-course {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
  }
  .chip-category {
    background: var(--rm-success-soft, #e2eee7);
    color: var(--rm-success, #326044);
  }
  .chip-collection {
    background: var(--rm-warning-soft, #f2ebd5);
    color: var(--rm-warning, #765600);
  }
  .chip-tag {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
  }

  /* Scaler */
  .scaler-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .scaler-icon {
    --mdc-icon-size: 18px;
    color: var(--rm-text-secondary);
    flex-shrink: 0;
  }
  .scaler-ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .scaler-btn {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
    padding: 0;
    transition: all 0.15s;
  }
  .scaler-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .scaler-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .scaler-val {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text);
    min-width: 34px;
    height: 34px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 8px;
  }

  /* Tabs */
  .tabs-row {
    display: flex;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    margin-bottom: 14px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs-row::-webkit-scrollbar {
    display: none;
  }
  .tab-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 11px 14px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text-secondary, #8e8e93);
    transition:
      color 0.15s,
      border-color 0.15s;
    white-space: nowrap;
  }
  .tab-btn.active {
    color: var(--rm-accent, #ff6b35);
    border-bottom-color: var(--rm-accent, #ff6b35);
  }

  /* Wake lock button */
  .wakelock-row {
    display: flex;
    justify-content: flex-end;
    padding: 4px 0 10px;
  }
  .wakelock-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    cursor: pointer;
    color: var(--rm-text-secondary);
    transition: all 0.15s;
  }
  .wakelock-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .wakelock-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .wakelock-unsupported {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px dashed var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-muted);
  }
  .wakelock-unsupported ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Metric toggle */
  .metric-toggle-row {
    display: flex;
    justify-content: flex-end;
    padding: 0 0 8px;
  }
  .metric-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    cursor: pointer;
    color: var(--rm-text-secondary);
    transition: all 0.15s;
  }
  .metric-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .metric-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }

  /* Ingredient section heading */
  .ing-heading {
    list-style: none;
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rm-accent);
    padding: 10px 0 4px;
    margin-top: 6px;
  }

  /* Ingredients */
  .ingredient-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
  }
  .ingredient-item {
    display: flex;
    gap: 10px;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
  }
  .ingredient-item:last-child {
    border-bottom: none;
  }
  .ing-amount {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-accent, #ff6b35);
    min-width: 70px;
    flex-shrink: 0;
  }
  .ing-name {
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
  }
  .ing-notes {
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    font-style: italic;
  }

  /* Ingredient checkbox selection */
  .ingredient-item.selectable {
    cursor: pointer;
    border-radius: 6px;
    padding-left: 4px;
  }
  .ingredient-item.selectable:hover {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.1));
  }
  .ing-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--rm-border, rgba(255, 255, 255, 0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .ing-check.checked {
    background: var(--rm-accent, #ff6b35);
    border-color: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }
  .ing-check ha-icon {
    --mdc-icon-size: 12px;
  }

  /* Shopping */
  .shopping-section {
    margin-top: 12px;
  }
  .shopping-btn {
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
  .shopping-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .shopping-picker-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    padding: 10px;
  }
  .picker-select-row {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }
  .picker-sel-btn {
    background: none;
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 6px;
    color: var(--rm-text-secondary, #8e8e93);
    padding: 4px 10px;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .picker-sel-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-text);
  }
  .picker-btns {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .shopping-note {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
  }
  .list-select {
    flex: 1;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    min-width: 120px;
  }
  .shopping-success {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--rm-success, #326044);
    font-size: var(--rm-font-size-sm, 14px);
    padding: 8px 0;
  }
  .shopping-success ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Directions */
  .steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .step-item {
    display: flex;
    gap: 14px;
    margin-bottom: 20px;
    align-items: flex-start;
  }
  .step-num {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    background: var(--rm-accent, #ff6b35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-accent-text, #fff);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
    user-select: none;
  }
  .step-num:hover {
    opacity: 0.8;
  }
  .step-num.done {
    background: transparent;
    border: 2px solid var(--rm-border, rgba(255, 255, 255, 0.2));
    color: var(--rm-text-muted);
  }
  .step-num.done ha-icon {
    --mdc-icon-size: 16px;
  }
  .step-item.step-done .step-text {
    color: var(--rm-text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--rm-border);
  }
  .step-text {
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
    line-height: 1.7;
    transition: opacity 0.2s;
  }

  /* Timer chip in directions */
  .time-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
    color: var(--rm-accent, #ff6b35);
    border: 1px solid var(--rm-accent, #ff6b35);
    border-radius: 12px;
    padding: 1px 7px;
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    vertical-align: middle;
  }
  .time-chip ha-icon {
    --mdc-icon-size: 12px;
  }
  .time-chip:hover {
    background: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }

  /* Notes */
  .notes-text {
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
    line-height: 1.6;
  }
  .empty-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    text-align: center;
    padding: 20px 0;
    margin: 0;
  }
  .empty-tab ha-icon {
    --mdc-icon-size: 40px;
    opacity: 0.35;
  }
  .empty-tab p {
    margin: 0;
  }

  /* Nutrition (legacy table) */
  .nutrition-panel {
    max-width: 340px;
    border: 2px solid var(--rm-text, #e5e5ea);
    border-radius: 4px;
    padding: 8px 12px;
    margin: 0 auto;
  }
  .nutr-header {
    font-size: 28px;
    font-weight: 900;
    color: var(--rm-text, #e5e5ea);
    line-height: 1;
    margin-bottom: 2px;
  }
  .nutr-sub {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    margin-bottom: 6px;
  }
  .nutr-divider {
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.15));
    margin: 2px 0;
  }
  .nutr-divider.thick {
    border-top: 6px solid var(--rm-text, #e5e5ea);
    margin: 4px 0;
  }
  .nutr-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 0;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
  }
  .nutr-bold {
    font-weight: 700;
    font-size: var(--rm-font-size-base, 16px);
  }
  .nutr-indent {
    padding-left: 14px;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .nutr-val {
    font-weight: 600;
    white-space: nowrap;
  }
  .nutr-val em {
    font-style: normal;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
  }

  /* Nutrition card */
  .nutr-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .nutr-top {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .nutr-ring-wrap {
    flex-shrink: 0;
    width: 90px;
    height: 90px;
  }
  .nutr-macro-cols {
    display: flex;
    gap: 10px;
    flex: 1;
    justify-content: space-around;
  }
  .nutr-macro-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .nutr-mcol-num {
    font-size: 17px;
    font-weight: 700;
    line-height: 1;
  }
  .nutr-mcol-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary);
    font-weight: 500;
  }
  .nutr-mcol-pct {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
  }
  .nutr-serving-note {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-muted);
    text-align: center;
    margin-top: -4px;
  }
  /* Daily RDA expandable */
  .nutr-rda-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    border-top: 1px solid var(--rm-border);
    padding: 10px 0 0;
    cursor: pointer;
    color: var(--rm-text);
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    width: 100%;
    text-align: left;
  }
  .nutr-rda-title {
    flex: 1;
  }
  .nutr-rda-count {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    color: var(--rm-text-secondary);
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 10px;
    padding: 1px 7px;
  }
  .nutr-rda-toggle ha-icon {
    --mdc-icon-size: 18px;
    color: var(--rm-text-secondary);
  }
  .nutr-rda-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 6px;
  }
  .nutr-rda-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-rows: auto 4px;
    column-gap: 8px;
    row-gap: 4px;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .nutr-rda-label {
    color: var(--rm-text-secondary);
    grid-column: 1;
    grid-row: 1;
  }
  .nutr-rda-val {
    color: var(--rm-text);
    font-weight: 600;
    grid-column: 2;
    grid-row: 1;
    white-space: nowrap;
  }
  .nutr-rda-pct {
    color: var(--rm-text-muted);
    grid-column: 3;
    grid-row: 1;
    white-space: nowrap;
    min-width: 36px;
    text-align: right;
  }
  .nutr-rda-bar-wrap {
    grid-column: 1 / -1;
    grid-row: 2;
    background: var(--rm-border);
    border-radius: 2px;
    height: 4px;
    overflow: hidden;
  }
  .nutr-rda-bar {
    height: 100%;
    background: var(--rm-accent);
    border-radius: 2px;
    transition: width 0.3s;
  }
  .nutr-rda-bar.over {
    background: var(--rm-error, #983d25);
  }

  /* Photos tab */
  .photos-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .photo-item {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
  }
  .photo-item.main-photo {
    border-color: var(--rm-accent, #ff6b35);
  }
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo-badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .photo-action {
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    padding: 0;
    transition: background 0.15s;
  }
  .photo-action ha-icon {
    --mdc-icon-size: 14px;
  }
  .photo-action:hover {
    background: rgba(0, 0, 0, 0.85);
  }
  .remove-photo {
    top: 4px;
    right: 4px;
  }
  .set-main {
    bottom: 4px;
    left: 4px;
  }

  .photo-add-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
  }
  .photo-add-label {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .photo-url-row {
    display: flex;
    gap: 8px;
  }
  .photo-url-input {
    flex: 1;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
  }
  .photo-url-input:focus {
    outline: none;
    border-color: var(--rm-accent, #ff6b35);
  }
  .camera-btns {
    display: flex;
    gap: 10px;
  }
  .camera-btn-split {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 2px solid var(--rm-accent, #ff6b35);
    border-radius: 10px;
    color: var(--rm-text, #e5e5ea);
    padding: 16px 8px;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
    text-align: center;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .camera-btn-split:hover {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
  }
  .camera-btn-split ha-icon {
    --mdc-icon-size: 28px;
    color: var(--rm-accent, #ff6b35);
  }
  .camera-input {
    display: none;
  }

  /* Buttons */
  .action-btn {
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 14px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s;
  }
  .action-btn.primary {
    background: var(--rm-accent, #ff6b35);
    border-color: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }
  .action-btn:disabled {
    color: var(--rm-disabled-text, var(--rm-text-secondary));
    background: var(--rm-disabled-bg, var(--rm-bg-elevated));
    cursor: not-allowed;
  }
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rm-text-secondary, #8e8e93);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  /* Edit overlay */
  .edit-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    z-index: 10;
  }
  .edit-panel {
    background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
    border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
    width: 100%;
    max-height: 82vh;
    display: flex;
    flex-direction: column;
  }
  .edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    font-weight: 600;
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
    flex-shrink: 0;
  }
  .edit-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .edit-section-label {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rm-text-muted, #8e8e93);
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
  }
  .edit-row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .edit-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .edit-field label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .edit-field input,
  .edit-field textarea {
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    resize: vertical;
  }
  .edit-field input:focus,
  .edit-field textarea:focus {
    outline: none;
    border-color: var(--rm-accent, #ff6b35);
  }
  .edit-photo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
  }
  .edit-photo-thumb {
    position: relative;
    width: 144px;
    height: 144px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid transparent;
    transition: border-color 0.15s;
  }
  .edit-photo-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .edit-photo-thumb.selected {
    border-color: var(--rm-accent, #ff6b35);
  }
  .edit-thumb-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: var(--rm-accent, #ff6b35);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .edit-thumb-badge ha-icon {
    --mdc-icon-size: 16px;
    color: var(--rm-accent-text, #fff);
  }
  .edit-photo-add {
    width: 144px;
    height: 144px;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    border: 2px dashed var(--rm-accent, #ff6b35);
    cursor: pointer;
    color: var(--rm-accent, #ff6b35);
    transition: background 0.15s;
  }
  .edit-photo-add:hover {
    background: var(--rm-accent-soft);
  }
  .edit-photo-add.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .edit-photo-add ha-icon {
    --mdc-icon-size: 40px;
  }
  .edit-stars {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }
  .edit-star {
    font-size: 32px;
    color: var(--rm-border, rgba(255, 255, 255, 0.3));
    cursor: pointer;
    transition: color 0.12s;
    line-height: 1;
    -webkit-text-stroke: 1px rgba(200, 150, 50, 0.5);
  }
  .edit-star.filled {
    color: #f5a623;
    -webkit-text-stroke: 1px #d4881b;
  }
  .edit-star:hover {
    color: #f5a623;
  }
  .edit-footer {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
  }
  .edit-footer-right {
    display: flex;
    gap: 8px;
  }

  /* Edit ingredient/step lists */
  .edit-ing-list,
  .edit-steps-list {
    list-style: none;
    padding: 0;
    margin: 0 0 6px;
  }
  .edit-ing-list li,
  .edit-steps-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
  }
  .edit-ing-heading {
    font-weight: 700;
    color: var(--rm-accent) !important;
  }
  .edit-ing-text {
    flex: 1;
    line-height: 1.4;
  }
  .drag-handle {
    flex-shrink: 0;
    cursor: grab;
    color: var(--rm-text-muted, #636366);
    --mdc-icon-size: 18px;
    touch-action: none;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
  .edit-ing-list li.drag-over,
  .edit-steps-list li.drag-over {
    border-top: 2px solid var(--rm-accent);
    margin-top: -1px;
  }
  .edit-reorder-btns {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 0;
  }
  .edit-move-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    color: var(--rm-text-secondary, #8e8e93);
    --mdc-icon-size: 14px;
  }
  .edit-move-btn:disabled {
    opacity: 0.2;
    cursor: default;
  }
  .edit-remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    color: var(--rm-text-secondary, #8e8e93);
    padding: 2px;
    margin-top: 1px;
  }
  .edit-remove-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .edit-add-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-bottom: 4px;
  }
  .edit-add-row input,
  .edit-add-row textarea {
    flex: 1;
    background: var(--rm-bg-elevated, #232833);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 7px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    resize: none;
  }
  .edit-add-row input:focus,
  .edit-add-row textarea:focus {
    outline: none;
    border-color: var(--rm-accent, #9fa8da);
  }
  .edit-add-btn {
    background: var(--rm-accent, #9fa8da);
    border: none;
    border-radius: 8px;
    color: var(--rm-accent-text, #fff);
    padding: 7px 12px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Danger outline button */
  .action-btn.danger-outline {
    color: var(--rm-error, #983d25);
    border-color: var(--rm-error, #983d25);
  }
  .action-btn.danger-outline:hover {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }

  /* ── Wide grid layout (2 cols × auto rows) ─────────────── */
  /* Whole card scrolls — no independent column scrolling */
  .detail-container.wide {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .wide-layout {
    --ion-grid-columns: 12;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  /* Each row is a flex container — no gap (columns are exact % fractions summing to 100%).
       align-items:stretch makes both columns the same height.
       Column spacing uses margin-left + reduced width on col-2 items. */
  .wide-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    box-sizing: border-box;
  }

  /* Col 1 — image card: exact Ionic 4/12 column; aspect-ratio:1/1 makes height = width */
  .wide-image-card {
    flex: 0 0 calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    min-width: 0;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    overflow: hidden;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
  }
  .wide-image-square {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  .wide-image-square img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .wide-image-square .hero-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
  }
  .wide-image-square .hero-placeholder ha-icon {
    --mdc-icon-size: 64px;
    opacity: 0.3;
  }
  .slide-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.45);
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 2;
    transition: background 0.15s;
  }
  .slide-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  .slide-btn ha-icon {
    --mdc-icon-size: 20px;
  }
  .slide-prev {
    left: 6px;
  }
  .slide-next {
    right: 6px;
  }
  .slide-dots {
    position: absolute;
    bottom: 7px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 2;
  }
  .slide-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
    transition: background 0.15s;
  }
  .slide-dot.active {
    background: #fff;
  }

  /* Col 2 — info card: 8/12 minus the 14px gap, with margin-left for the gap */
  .wide-info-card {
    flex: 0 0 calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    max-width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    min-width: 0;
    box-sizing: border-box;
    margin-left: 14px;
    border-radius: 16px;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .wide-title {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 700;
    color: var(--rm-text);
    line-height: 1.2;
    text-align: center;
  }
  .wide-desc {
    text-align: center;
    margin: 6px 0;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary);
    line-height: 1.5;
  }
  .wide-info-card .quick-rating {
    justify-content: center;
    margin-bottom: 6px;
  }
  .wide-info-card .action-btns-row {
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .wide-info-card .meta-chips {
    justify-content: center;
    margin-top: 6px;
  }
  /* Chips pushed to bottom-left of info card */
  .wide-info-card .chips-area {
    align-self: flex-start;
    margin-top: auto;
    padding-top: 10px;
  }

  /* Row 2, Col 1 — ingredients column: exact Ionic 4/12, aligns with image above */
  .wide-ing-col {
    flex: 0 0 calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Row 2, Col 2 — directions column: 8/12 minus gap, margin-left for spacing */
  .wide-dir-col {
    flex: 0 0 calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    max-width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    min-width: 0;
    margin-left: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Ingredients column controls: scaler left, cart right — above ingredients only */
  .wide-ing-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 2px;
    min-height: 42px;
  }
  .wide-dir-spacer {
    min-height: 42px;
  }
  .ing-shop-btn {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
    padding: 0;
    transition: all 0.15s;
  }
  .ing-shop-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .ing-shop-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .ing-shop-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .ing-shop-success {
    color: var(--rm-success, #326044);
    display: flex;
    align-items: center;
  }
  .ing-shop-success ha-icon {
    --mdc-icon-size: 22px;
  }
  .shopping-review-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    padding: 12px;
  }
  .review-title {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .review-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
  .review-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .review-ing {
    display: flex;
    align-items: baseline;
    gap: 4px;
    flex-wrap: wrap;
  }
  .review-qty {
    font-size: 0.8rem;
    color: var(--rm-text-secondary, #8e8e93);
    flex-shrink: 0;
  }
  .review-ing-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
  .review-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .review-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1.5px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    background: none;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text, #e5e5ea);
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .review-chip ha-icon {
    --mdc-icon-size: 13px;
  }
  .review-chip.selected {
    border-color: var(--rm-accent, #ff6b35);
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    color: var(--rm-accent, #ff6b35);
    font-weight: 600;
  }
  .review-chip.manual {
    border-style: dashed;
  }
  .review-btns {
    margin-top: 2px;
  }

  /* Section cards (ingredients, nutrition, notes) */
  .wide-section-card {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 14px;
    padding: 12px 14px;
  }
  .wide-section-title {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-text);
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--rm-border);
  }

  /* Per-step direction cards in wide layout */
  .wide-step-card {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .wide-step-card .step-num {
    flex-shrink: 0;
  }
  .wide-step-card .step-text {
    flex: 1;
  }
  .wide-step-card.step-done .step-text {
    color: var(--rm-text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--rm-border);
  }

  /* ── Markdown content ─────────────────────────────── */
  .md-content {
    font-size: var(--rm-font-size-sm, 14px);
    line-height: 1.65;
  }
  .md-content p {
    margin: 0 0 6px;
  }
  .md-content p.md-gap {
    margin: 0 0 10px;
  }
  .md-content h1 {
    font-size: 18px;
    font-weight: 700;
    margin: 10px 0 4px;
  }
  .md-content h2 {
    font-size: var(--rm-font-size-base, 16px);
    font-weight: 700;
    margin: 8px 0 4px;
  }
  .md-content h3 {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    margin: 6px 0 3px;
  }
  .md-content ul,
  .md-content ol {
    padding-left: 20px;
    margin: 4px 0 8px;
  }
  .md-content li {
    margin: 2px 0;
  }
  .md-content strong {
    font-weight: 700;
  }
  .md-content em {
    font-style: italic;
  }
  .md-content code {
    font-family: monospace;
    font-size: var(--rm-font-size-xs, 12px);
    background: var(--rm-bg-elevated);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .md-content a {
    color: var(--rm-accent);
    text-decoration: none;
  }
  .md-content a:hover {
    text-decoration: underline;
  }
  .md-content hr {
    border: none;
    border-top: 1px solid var(--rm-border);
    margin: 8px 0;
  }

  /* ── List picker (tags / courses / categories / collections) ─── */
  .list-picker-field {
    position: relative;
  }
  .list-picker-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .list-picker-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    min-height: 28px;
  }
  .list-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 14px;
    font-size: var(--rm-font-size-xs, 12px);
    border: 1px solid var(--rm-border);
    background: var(--rm-bg-elevated);
    color: var(--rm-text);
    cursor: default;
    transition: all 0.12s;
  }
  .list-chip.selected {
    background: var(--rm-accent-soft);
    border-color: var(--rm-accent);
    color: var(--rm-accent);
  }
  .list-chip.available {
    cursor: pointer;
    color: var(--rm-text-muted);
  }
  .list-chip.available:hover {
    border-color: var(--rm-accent);
    color: var(--rm-accent);
    background: var(--rm-accent-soft);
  }
  .list-chip-remove {
    background: none;
    border: none;
    padding: 0 0 0 2px;
    cursor: pointer;
    color: inherit;
    font-size: var(--rm-font-size-sm, 14px);
    line-height: 1;
    opacity: 0.7;
  }
  .list-chip-remove:hover {
    opacity: 1;
  }
  .list-chip-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px dashed var(--rm-border);
    background: none;
    cursor: pointer;
    color: var(--rm-text-muted);
    transition: all 0.12s;
  }
  .list-chip-add-btn:hover {
    border-color: var(--rm-accent);
    color: var(--rm-accent);
  }
  .list-chip-add-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .list-picker-dropdown {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  }
  .list-picker-existing {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .list-picker-new-row {
    display: flex;
    gap: 6px;
  }
  .list-picker-input {
    flex: 1;
    background: var(--rm-bg-surface, var(--rm-bg-main));
    border: 1px solid var(--rm-border);
    border-radius: 7px;
    color: var(--rm-text);
    padding: 5px 9px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    min-width: 0;
  }
  .list-picker-input:focus {
    outline: none;
    border-color: var(--rm-accent);
  }
  .list-picker-new-btn {
    padding: 5px 12px;
    border-radius: 7px;
    border: 1px solid var(--rm-accent);
    background: var(--rm-accent);
    color: var(--rm-accent-text, #fff);
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
  }
  .list-picker-new-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ── Inline ingredient edit ──────────────────────── */
  .edit-ing-text {
    cursor: pointer;
    flex: 1;
  }
  .edit-ing-text:hover {
    color: var(--rm-accent);
  }
  .edit-ing-inline-edit {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
    list-style: none;
  }
  .ing-inline-input {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-accent);
    border-radius: 6px;
    color: var(--rm-text);
    padding: 4px 6px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    min-width: 0;
  }
  .ing-inline-input:focus {
    outline: none;
  }
  .ing-inline-amt {
    width: 52px;
    flex: 0 0 52px;
  }
  .ing-inline-unit {
    width: 60px;
    flex: 0 0 60px;
  }
  .ing-inline-name {
    flex: 1;
  }
  .ing-inline-save,
  .ing-inline-cancel {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid var(--rm-border);
    background: none;
    cursor: pointer;
    color: var(--rm-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ing-inline-save {
    border-color: var(--rm-accent);
    color: var(--rm-accent);
  }
  .ing-inline-save:hover {
    background: var(--rm-accent);
    color: var(--rm-accent-text, #fff);
  }
  .ing-inline-save ha-icon,
  .ing-inline-cancel ha-icon {
    --mdc-icon-size: 13px;
  }

  .detail-container,
  .detail-right,
  .detail-left-scroll,
  .detail-right-scroll,
  .detail-scroll,
  .edit-body {
    min-width: 0;
    min-height: 0;
  }
  .detail-desc,
  .ing-name,
  .notes-text,
  .recipe-title {
    overflow-wrap: anywhere;
  }
  .action-btn,
  .tab-btn,
  .wakelock-btn,
  .metric-btn,
  .photo-url-input,
  .edit-field input,
  .edit-field textarea {
    min-height: var(--rm-touch-target, 44px);
  }
  .hero-btn,
  .scaler-btn,
  .icon-btn,
  .photo-action,
  .slide-btn,
  .ing-shop-btn {
    width: var(--rm-touch-target, 44px);
    height: var(--rm-touch-target, 44px);
  }
  .action-icon-btn {
    width: 76px;
    line-height: 1.4;
  }
  .edit-field input,
  .edit-field textarea,
  .photo-url-input {
    font-size: var(--rm-font-size-base, 16px);
    border-color: var(--rm-border-strong, var(--rm-border));
  }
  .edit-panel {
    border: 1px solid var(--rm-border);
    max-height: 82dvh;
  }
  .edit-footer,
  .edit-footer-right {
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .edit-row-3 {
      grid-template-columns: minmax(0, 1fr);
    }
    .action-btns-row {
      gap: 8px;
    }
    .nutr-top {
      flex-wrap: wrap;
      justify-content: center;
    }
    .photo-url-row {
      flex-wrap: wrap;
    }
  }
  ${componentStyles}
`;
