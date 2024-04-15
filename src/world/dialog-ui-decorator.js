import { DialogUi } from './dialog-ui.js';

export class DialogDecorator extends DialogUi {
  /**
   *
   * @param {DialogUi} dialog
   */
  constructor(dialog) {
    super(dialog.scene, dialog.width);
    this.dialog = dialog;
  }

  /**
   * @param {string[]} messages
   * @returns {void}
   */
  showDialogModal(messages) {
    this.dialog.showDialogModal(messages);
  }

  hideDialogModal() {
    this.dialog.hideDialogModal();
  }

  showNextMessage() {
    this.dialog.showNextMessage();
  }
}
