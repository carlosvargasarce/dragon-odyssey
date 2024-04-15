import { DialogDecorator } from './dialog-ui-decorator.js';
import { DialogUi } from './dialog-ui.js';

export class CustomStyleDecorator extends DialogDecorator {
  /**
   *
   * @param {DialogUi} dialog
   * @param {number} newWidth
   * @param {number} newHeight
   * @param {number} newPadding
   */
  constructor(dialog, newWidth, newHeight, newPadding) {
    super(dialog);
    this.newWidth = newWidth;
    this.newHeight = newHeight;
    this.newPadding = newPadding;
  }

  /**
   * @param {string[]} messages
   * @returns {void}
   */
  showDialogModal(messages) {
    this.dialog.width = this.newWidth;
    this.dialog.height = this.newHeight;
    this.dialog.padding = this.newPadding;
    super.showDialogModal(messages);
  }
}
