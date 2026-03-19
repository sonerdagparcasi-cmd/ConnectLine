export type ScheduledReminder = {
  id: string;
  sendAt: number; // timestamp (ms)
  onFire: () => void;
};

class ChatReminderScheduler {
  /**
   * 🔒 Tek kontrol noktası
   * - reminderId → timeout
   */
  // RN ortamında NodeJS.Timeout tipi yok; güvenli tip: ReturnType<typeof setTimeout>
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * schedule
   *
   * - Aynı id ile tekrar çağrılırsa:
   *   → eski timer iptal edilir (update-safe)
   * - sendAt geçmişse:
   *   → onFire hemen çalışır
   */
  schedule(reminder: ScheduledReminder) {
    // 🔁 aynı id varsa önce iptal et (çok kritik)
    this.cancel(reminder.id);

    const delay = reminder.sendAt - Date.now();

    if (delay <= 0) {
      reminder.onFire();
      return;
    }

    const timer = setTimeout(() => {
      try {
        reminder.onFire();
      } finally {
        // 🧹 fire sonrası cleanup
        this.timers.delete(reminder.id);
      }
    }, delay);

    this.timers.set(reminder.id, timer);
  }

  /**
   * cancel
   *
   * - güvenli (id yoksa sessiz)
   */
  cancel(id: string) {
    const timer = this.timers.get(id);
    if (!timer) return;

    clearTimeout(timer);
    this.timers.delete(id);
  }

  /**
   * clearAll
   *
   * - logout / session reset için
   */
  clearAll() {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timers.clear();
  }
}

export const chatReminderScheduler = new ChatReminderScheduler();