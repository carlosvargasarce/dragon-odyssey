export default class DialogUiDecorator {
  /**
   * @param {import("./dialog-ui.js").DialogUi} dialogUi
   */
  constructor(dialogUi) {
    this.dialogUi = dialogUi;
    this.autoAdvanceTimer = null; // Timer handle for auto-advancing messages
    this.onComplete = null;
  }

  /**
   * @param {string[]} messages
   * @returns {void}
   */
  showDialogModal(messages) {
    console.log('Showing dialog with messages:', messages);
    this.dialogUi.showDialogModal(messages);
    this.scheduleNextMessage(); // Start scheduling the next message
  }

  showNextMessage() {
    if (!this.dialogUi.isAnimationPlaying && this.dialogUi.moreMessagesToShow) {
      console.log('Showing next message.');
      this.dialogUi.showNextMessage();
      this.scheduleNextMessage(); // Continue scheduling if more messages exist
    } else if (!this.dialogUi.moreMessagesToShow) {
      this.hideDialogModal(); // No more messages, hide the dialog
    }
  }

  hideDialogModal() {
    console.log('Hiding dialog modal.');
    this.dialogUi.hideDialogModal();
    clearTimeout(this.autoAdvanceTimer); // Clear the timer when hiding the dialog

    // Notify scene when everything is truly complete
    if (this.onComplete) {
      this.onComplete();
    }
  }

  // Setup a method to register a completion callback
  setOnComplete(callback) {
    this.onComplete = callback;
  }

  // Set up a simple polling mechanism to check for animation status
  scheduleNextMessage() {
    clearTimeout(this.autoAdvanceTimer); // Ensure no previous timers are running
    this.autoAdvanceTimer = setTimeout(() => {
      if (!this.dialogUi.isAnimationPlaying) {
        this.showNextMessage(); // Show next message if animation has stopped
      } else {
        this.scheduleNextMessage(); // Reschedule to check again
      }
    }, 500); // Check every 500 milliseconds
  }
}
