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
      return node.getClientRects().length && style.visibility === 'visible' && !node.disabled;
    }).flatMap(node => {
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
      const measure = (textStyle, text, pseudo = null) => {
        const fontSize = parseFloat(textStyle.fontSize);
        const textOpacity = opacity * (pseudo ? Number(textStyle.opacity) : 1);
        // Accessible labels can be hidden with font-size:0 while a generated
        // glyph remains visible. Measure each rendered text surface separately.
        if (!text.trim() || fontSize <= 0 || !textOpacity || textStyle.display === 'none' || textStyle.visibility !== 'visible') return [];
        const textBackground = pseudo ? over(rgba(textStyle.backgroundColor), background) : background;
        const color = rgba(textStyle.color);
        color[3] *= textOpacity;
        const foreground = over(color, textBackground);
        const a = luminance(foreground), b = luminance(textBackground);
        return [{
          tag: node.tagName,
          class: node.className,
          text: text.trim().slice(0, 80),
          placeholder: pseudo === '::placeholder',
          pseudo,
          contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05),
          foreground: textStyle.color,
          fontSize,
          background: textBackground,
        }];
      };
      const measurements = measure(
        placeholder ? getComputedStyle(node, '::placeholder') : style,
        node.value || node.placeholder || node.textContent,
        placeholder ? '::placeholder' : null,
      );
      for (const pseudo of ['::before', '::after']) {
        const textStyle = getComputedStyle(node, pseudo);
        const content = textStyle.content.match(/^(["'])(.*)\1$/s);
        if (content) measurements.push(...measure(textStyle, content[2], pseudo));
      }
      return measurements;
    });
  }, selectors);
}
