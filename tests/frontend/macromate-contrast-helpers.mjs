// Measure rendered solid-color text, composing translucent surfaces through
// shadow boundaries. Image captions and gradient text need separate pixel tests.
export async function measureTextContrast(locator, selectors) {
  return locator.evaluate((host, selectors) => {
    const parent = node => node.parentElement || node.getRootNode().host;
    const rgba = text => {
      const values = text.match(/[\d.]+/g).map(Number);
      return [...values.slice(0, 3), values[3] ?? 1];
    };
    const over = (top, base) => top.slice(0, 3).map((c, i) => c * top[3] + base[i] * (1 - top[3]));
    const luminance = rgb => rgb.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    return [...host.shadowRoot.querySelectorAll(selectors)].filter(node => {
      const style = getComputedStyle(node);
      return node.getClientRects().length && style.visibility !== 'hidden' && !node.disabled &&
        (node.textContent.trim() || node.value || node.placeholder);
    }).map(node => {
      const ancestors = [];
      for (let p = node; p; p = parent(p)) ancestors.unshift(p);
      let background = [255, 255, 255], opacity = 1;
      for (const ancestor of ancestors) {
        const style = getComputedStyle(ancestor);
        opacity *= Number(style.opacity);
        background = over(rgba(style.backgroundColor), background);
      }
      const style = getComputedStyle(node);
      const placeholder = node.matches('input,textarea') && !node.value && node.placeholder;
      const textStyle = placeholder ? getComputedStyle(node, '::placeholder') : style;
      const color = rgba(textStyle.color);
      color[3] *= opacity * (placeholder ? Number(textStyle.opacity) : 1);
      const foreground = over(color, background);
      const a = luminance(foreground), b = luminance(background);
      return {
        tag: node.tagName,
        class: node.className,
        text: (node.value || node.placeholder || node.textContent).trim().slice(0, 80),
        placeholder: Boolean(placeholder),
        contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05),
        foreground: textStyle.color,
        fontSize: parseFloat(style.fontSize),
        background,
      };
    });
  }, selectors);
}
