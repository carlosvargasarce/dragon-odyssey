import WebFont from 'webfontloader';

export class WebFontFileLoader extends Phaser.Loader.File {
  /** @type {string[]} */
  #fontNames;

  /**
   * @param {Phaser.Loader.LoaderPlugin} loader
   * @param {string[]} fontNames
   */
  constructor(loader, fontNames) {
    super(loader, {
      type: 'webfont',
      key: fontNames.toString(),
    });

    this.#fontNames = fontNames;
  }

  load() {
    console.log('FONT NAMES', this.#fontNames);
    WebFont.load({
      google: {
        families: this.#fontNames,
      },
      active: () => {
        this.loader.nextFile(this, true);
      },
      inactive: () => {
        console.error(
          `Failed to load google fonts ${JSON.stringify(this.#fontNames)}`
        );
        this.loader.nextFile(this, false);
      },
    });
  }
}
