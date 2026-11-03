export const state = {
  schedules: [], history: [], route: 'dashboard',
  importDraft: null, importFiles: [], importPreview: null,
  calendarDate: new Date(), calendarSelectedDate: null,
  scheduleFilters: { search: '', className: '', type: '', status: '' },
  reminderSettings: { enabled: true, intervals: [60, 15, 5], customMinutes: 10 },
  teacher: { name: 'Raga Triagantara, S.Kom.', id: '211032' },
  theme: 'system'
};

export function setState(patch) { Object.assign(state, patch); }
