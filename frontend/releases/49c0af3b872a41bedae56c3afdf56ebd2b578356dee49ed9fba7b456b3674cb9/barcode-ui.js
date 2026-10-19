import { translator } from "./i18n.js";
import { el, button, field } from "./dom.js";
import { openDialog } from "./entry-ui.js";
import { validGTIN } from "./barcode.js";
import { CameraScanner, decodeSource } from "./scanner.js";
export class BarcodeUI {
  constructor(panel) {
    this.t = translator(panel);
    this.panel = panel;
  }
  render() {
    this.input = this.panel.foodBrowser.query;
    return button(this.t("Scan barcode"), () => this.openScanner(), {
      "data-scan": true,
      "aria-label": this.t("Scan barcode"),
      title: this.t("Scan barcode"),
    });
  }
  async lookup(barcode) {
    if (!validGTIN(barcode)) {
      this.panel.message.replaceChildren(
        el(
          "p",
          { role: "alert" },
          this.t(
            "Invalid barcode: enter 8, 12, 13 or 14 ASCII digits with a valid check digit.",
          ),
        ),
      );
      return;
    }
    this.input.querySelector("input").value = barcode;
    const browser = this.panel.foodBrowser;
    const context = browser.readContext();
    try {
      const result = await this.panel.client.read("barcode", {
        barcode,
        online: true,
      });
      if (browser.current(context)) {
        this.panel.message.replaceChildren();
        browser.showResults(result);
      }
    } catch (error) {
      if (browser.current(context)) this.panel.showError(error);
    }
  }
  openScanner() {
    let dialog;
    let imageGeneration = 0;
    const video = el("video", {
      muted: true,
      playsinline: true,
      "aria-label": this.t("Camera preview"),
    });
    video.muted = true;
    const status = el(
      "p",
      { role: "status", "aria-live": "polite" },
      this.t(
        "Hold the barcode steady across the camera. Decoding is local; images are not uploaded.",
      ),
    );
    const finish = (value) => {
      if (!dialog.open || !this.panel.isConnected) return;
      this.stop();
      dialog.close();
      this.lookup(value);
    };
    this.scanner = new CameraScanner(video, {
      onResult: finish,
      onError: (text) => (status.textContent = this.t(text)),
    });
    const image = field(this.t("Choose barcode image"), {
      type: "file",
      accept: "image/*",
    });
    image.addEventListener("change", async (event) => {
      this.scanner.stop();
      const generation = ++imageGeneration;
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) {
        status.textContent = this.t("Image is too large (maximum 20 MB).");
        return;
      }
      status.textContent = this.t("Reading image locally…");
      const url = URL.createObjectURL(file);
      try {
        const source = new Image();
        source.src = url;
        await source.decode();
        const value = await decodeSource(source);
        if (generation !== imageGeneration || !dialog.open) return;
        if (value) finish(value);
        else
          status.textContent = this.t(
            "No valid barcode found. Choose a sharper image or restart the camera.",
          );
      } catch {
        if (generation === imageGeneration && dialog.open)
          status.textContent = this.t(
            "Could not read the image. Choose another image.",
          );
      } finally {
        URL.revokeObjectURL(url);
      }
    });
    const hidden = () => {
      if (document.hidden) {
        this.scanner.stop();
        status.textContent = this.t(
          "Camera paused. Start the camera to continue.",
        );
      }
    };
    const cleanup = () => {
      imageGeneration++;
      this.scanner.stop();
      document.removeEventListener("visibilitychange", hidden);
    };
    this.stop = cleanup;
    dialog = openDialog(this.panel, this.t("Scan barcode"), [
      status,
      video,
      el(
        "div",
        { class: "actions" },
        button(this.t("Start camera"), () => {
          imageGeneration++;
          status.textContent = this.t("Starting camera…");
          this.scanner.start();
        }),
        button(this.t("Cancel"), () => {
          cleanup();
          dialog.close();
        }),
      ),
      image,
    ]);
    dialog.addEventListener("cancel", cleanup);
    dialog.addEventListener("close", cleanup, { once: true });
    document.addEventListener("visibilitychange", hidden);
  }
  stop() {
    this.scanner?.stop();
  }
}
