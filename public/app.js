/* =========================================================
   Workout Routine Catalog - Client App (Vanilla JS)
   เรียกใช้เฉพาะ REST API ของเซิร์ฟเวอร์ตัวเอง ไม่ใช้ External API
   ========================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------
  const API_BASE = '/api';

  /** คลังท่าสำเร็จรูป (Presets) สำหรับเติมข้อมูลในฟอร์มอัตโนมัติ */
  const PRESETS = [
    {
      key: 'pushup',
      name: 'Push-up',
      muscle: 'chest',
      level: 'beginner',
      equipment: 'bodyweight',
      sets: 3,
      reps: 12,
      duration: 0,
      status: 'active',
      description:
        'วางมือกว้างกว่าไหล่ ลำตัวเป็นเส้นตรง ค่อย ๆ ลดลงจนหน้าอกแตะพื้น แล้วดันกลับขึ้น'
    },
    {
      key: 'benchpress',
      name: 'Bench Press',
      muscle: 'chest',
      level: 'intermediate',
      equipment: 'barbell',
      sets: 4,
      reps: 8,
      duration: 0,
      status: 'active',
      description:
        'นอนหลังบนม้า จับหมู่เหล็กให้อยู่เหนือหน้าอก กดลงจนแตะอก ดันขึ้นจนแขนตรง'
    },
    {
      key: 'squat',
      name: 'Squat',
      muscle: 'legs',
      level: 'intermediate',
      equipment: 'barbell',
      sets: 5,
      reps: 5,
      duration: 0,
      status: 'active',
      description:
        'ยืดตัวลงให้ต้องขาอยู่ระดับเข่าหรือต่ำกว่า หลังตรง ก้นถอยไปหลัง แล้วดันกลับขึ้นยืน'
    },
    {
      key: 'pullup',
      name: 'Pull-up',
      muscle: 'back',
      level: 'advanced',
      equipment: 'bodyweight',
      sets: 3,
      reps: 8,
      duration: 0,
      status: 'active',
      description: 'แขวนบนบาร์แขนตรง ดึงแคนตามเข้าหาใต้เหนือหัว แล้วค่อย ๆ ปล่อยลง'
    },
    {
      key: 'plank',
      name: 'Plank',
      muscle: 'core',
      level: 'beginner',
      equipment: 'bodyweight',
      sets: 3,
      reps: 1,
      duration: 60,
      status: 'active',
      description:
        'วางฝ่ามือและปลายเท้าลงพื้น ยกสะโพกขึ้นให้ลำตัวเป็นเส้นตรง ค้างไว้ตามเวลาที่กำหนด'
    },
    {
      key: 'burpee',
      name: 'Burpee',
      muscle: 'full-body',
      level: 'intermediate',
      equipment: 'bodyweight',
      sets: 4,
      reps: 10,
      duration: 0,
      status: 'active',
      description: 'ยืน - นั่งลง - คลานลงพื้น - ดันขึ้น - กระโดดขึ้น แล้วทำซ้ำครบจำนวนครั้ง'
    },
    {
      key: 'lunge',
      name: 'Lunges',
      muscle: 'legs',
      level: 'beginner',
      equipment: 'bodyweight',
      sets: 3,
      reps: 12,
      duration: 0,
      status: 'active',
      description: 'ก้าวไปข้างหน้า ลดตัวจนเข่าหน้าลงระดับพื้น ดันกลับขึ้นยืน แล้วสลับข้า'
    },
    {
      key: 'deadlift',
      name: 'Deadlift',
      muscle: 'legs',
      level: 'advanced',
      equipment: 'barbell',
      sets: 3,
      reps: 5,
      duration: 0,
      status: 'active',
      description: 'ยืนก่อนแท่นเหล็ก ยกเหล็กจากพื้นด้วยแรงขาและหลัง จนยืนตรงเต็มตัว'
    },
    {
      key: 'shoulderpress',
      name: 'Shoulder Press',
      muscle: 'shoulders',
      level: 'intermediate',
      equipment: 'dumbbell',
      sets: 4,
      reps: 10,
      duration: 0,
      status: 'active',
      description: 'ถือดัมเบลระดับไหล่ ดันขึ้นเหนือศีรษะจนแขนตรง แล้วค่อย ๆ ลดลง'
    },
    {
      key: 'bicepscurl',
      name: 'Biceps Curl',
      muscle: 'arms',
      level: 'beginner',
      equipment: 'dumbbell',
      sets: 3,
      reps: 12,
      duration: 0,
      status: 'active',
      description: 'ยืนตรงถือดัมเบลละดับสะโพก งอแขนขึ้นให้ดัมเบลขึ้นถึงหน้าอก แล้วปล่อยช้า ๆ'
    }
  ];

  const MUSCLE_LABELS = {
    chest: 'Chest',
    back: 'Back',
    legs: 'Legs',
    core: 'Core',
    shoulders: 'Shoulders',
    arms: 'Arms',
    'full-body': 'Full Body'
  };

  const LEVEL_LABELS = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };

  const STATUS_LABELS = {
    active: 'Active',
    paused: 'Paused',
    archived: 'Archived'
  };

  const EQUIPMENT_ICONS = {
    bodyweight: '🤸',
    barbell: '🏋️',
    dumbbell: '🏋️‍♂️',
    kettlebell: '🔔',
    resistance_band: '🪢',
    machine: '⚙️'
  };

  // ---------------------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------------------
  const els = {
    form: document.getElementById('workoutForm'),
    fieldId: document.getElementById('fieldId'),
    fieldName: document.getElementById('fieldName'),
    fieldMuscle: document.getElementById('fieldMuscle'),
    fieldLevel: document.getElementById('fieldLevel'),
    fieldEquipment: document.getElementById('fieldEquipment'),
    fieldStatus: document.getElementById('fieldStatus'),
    fieldSets: document.getElementById('fieldSets'),
    fieldReps: document.getElementById('fieldReps'),
    fieldDuration: document.getElementById('fieldDuration'),
    fieldDescription: document.getElementById('fieldDescription'),

    formTitle: document.getElementById('formTitle'),
    formSub: document.getElementById('formSub'),
    btnSubmit: document.getElementById('btnSubmit'),
    btnCancelEdit: document.getElementById('btnCancelEdit'),

    presetSelect: document.getElementById('presetSelect'),
    presetChips: document.getElementById('presetChips'),
    btnLoadPreset: document.getElementById('btnLoadPreset'),
    btnClearPreset: document.getElementById('btnClearPreset'),

    filterMuscle: document.getElementById('filterMuscle'),
    filterLevel: document.getElementById('filterLevel'),
    filterStatus: document.getElementById('filterStatus'),
    filterSearch: document.getElementById('filterSearch'),
    btnResetFilter: document.getElementById('btnResetFilter'),
    activeFilters: document.getElementById('activeFilters'),

    list: document.getElementById('workoutList'),
    listCount: document.getElementById('listCount'),
    statTotal: document.getElementById('statTotal'),
    statActive: document.getElementById('statActive'),

    toastContainer: document.getElementById('toastContainer'),
    confirmModal: document.getElementById('confirmModal'),
    confirmText: document.getElementById('confirmText'),
    confirmOk: document.getElementById('confirmOk'),
    confirmCancel: document.getElementById('confirmCancel')
  };

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  const state = {
    workouts: [],
    editingId: null,
    selectedPreset: null,
    deleteTargetId: null,
    searchTimer: null
  };

  // ---------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------

  /** เรียก API ของเซิร์ฟเวอร์ตัวเอง */
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (res.status === 204) return null;

    let payload = null;
    try {
      payload = await res.json();
    } catch (e) {
      payload = null;
    }

    if (!res.ok) {
      const err = new Error(
        (payload && (payload.error || payload.message)) || `HTTP Error ${res.status}`
      );
      err.status = res.status;
      err.fields = (payload && payload.fields) || [];
      throw err;
    }
    return payload;
  }

  /** แสดง Toast แจ้งเตือน */
  function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    els.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /** escape HTML กัน XSS */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** แสดง/ซ่อน error ใต้ช่อง */
  function setFieldError(fieldName, message) {
    const el = document.querySelector(`.error-msg[data-for="${fieldName}"]`);
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (el) {
      el.textContent = message || '';
      el.classList.toggle('show', Boolean(message));
    }
    if (input) input.classList.toggle('invalid', Boolean(message));
  }

  function clearAllErrors() {
    document.querySelectorAll('.error-msg').forEach((e) => {
      e.textContent = '';
      e.classList.remove('show');
    });
    document.querySelectorAll('.control.invalid').forEach((e) => e.classList.remove('invalid'));
  }

  // ---------------------------------------------------------------------
  // Presets
  // ---------------------------------------------------------------------
  function renderPresets() {
    // Dropdown
    els.presetSelect.innerHTML =
      '<option value="">-- เลือกท่าสำเร็จรูป --</option>' +
      PRESETS.map((p) => `<option value="${p.key}">${escapeHtml(p.name)} (${MUSCLE_LABELS[p.muscle]})</option>`).join('');

    // Chips
    els.presetChips.innerHTML = PRESETS.map(
      (p) =>
        `<button type="button" class="preset-chip" data-preset="${p.key}">
           <span class="chip-dot"></span>${escapeHtml(p.name)}
         </button>`
    ).join('');

    els.presetChips.querySelectorAll('.preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        selectPreset(chip.dataset.preset);
        applyPresetToForm(chip.dataset.preset, true);
      });
    });
  }

  function selectPreset(key) {
    state.selectedPreset = key || null;
    els.presetSelect.value = key || '';
    els.presetChips.querySelectorAll('.preset-chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.preset === key);
    });
  }

  /** เติมข้อมูลจาก preset ลงฟอร์มอัตโนมัติ */
  function applyPresetToForm(key, notify = false) {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) {
      showToast('กรุณาเลือกท่าสำเร็จรูปก่อน', 'error');
      return;
    }

    // ถ้ากำลังอยู่โหมดแก้ไข ให้กลับไปโหมดเพิ่มใหม่ก่อน
    if (state.editingId !== null) {
      resetForm();
    }

    els.fieldName.value = preset.name;
    els.fieldMuscle.value = preset.muscle;
    els.fieldLevel.value = preset.level;
    els.fieldEquipment.value = preset.equipment;
    els.fieldStatus.value = preset.status;
    els.fieldSets.value = preset.sets;
    els.fieldReps.value = preset.reps;
    els.fieldDuration.value = preset.duration;
    els.fieldDescription.value = preset.description;

    clearAllErrors();
    document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (notify) {
      showToast(`เติมข้อมูล "${preset.name}" ลงฟอร์มให้อัตโนมัติแล้ว`, 'success');
    }
  }

  // ---------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------
  function getFormData() {
    return {
      name: els.fieldName.value.trim(),
      muscle: els.fieldMuscle.value,
      level: els.fieldLevel.value,
      equipment: els.fieldEquipment.value.trim(),
      status: els.fieldStatus.value,
      sets: els.fieldSets.value,
      reps: els.fieldReps.value,
      duration: els.fieldDuration.value === '' ? 0 : els.fieldDuration.value,
      description: els.fieldDescription.value.trim()
    };
  }

  /** ตรวจสอบฝั่ง Client ก่อนส่ง */
  function validateForm(data, isEdit = false) {
    const errors = {};

    if (!data.name) errors.name = 'กรุณากรอกชื่อท่า';
    if (!data.muscle) errors.muscle = 'กรุณาเลือกกลุ่มกล้ามเนื้อ';
    if (!data.level) errors.level = 'กรุณาเลือกระดับความยาก';
    if (!data.equipment) errors.equipment = 'กรุณากรอกอุปกรณ์ที่ใช้';
    if (!data.description) errors.description = 'กรุณากรอกรายละเอียดวิธีทำ';

    const sets = Number(data.sets);
    const reps = Number(data.reps);
    const duration = Number(data.duration);

    if (data.sets === '' || !Number.isInteger(sets) || sets < 1 || sets > 20) {
      errors.sets = 'sets ต้องเป็นจำนวนเต็ม 1-20';
    }
    if (data.reps === '' || !Number.isInteger(reps) || reps < 1 || reps > 200) {
      errors.reps = 'reps ต้องเป็นจำนวนเต็ม 1-200';
    }
    if (!Number.isFinite(duration) || duration < 0) {
      errors.duration = 'duration ต้องไม่ติดลบ';
    }

    if (isEdit) {
      delete errors.name;
      delete errors.muscle;
      delete errors.level;
      delete errors.equipment;
      delete errors.sets;
      delete errors.reps;
      delete errors.description;
    }

    return errors;
  }

  function setFormMode(editId, workout) {
    if (editId === null) {
      state.editingId = null;
      els.fieldId.value = '';
      els.formTitle.textContent = '➕ เพิ่มท่าออกกำลังกายใหม่';
      els.formSub.textContent = 'กรอกข้อมูลให้ครบทุกช่องที่มีเครื่องหมาย * แล้วกดบันทึก';
      els.btnSubmit.textContent = '💾 บันทึกท่านี้';
      els.btnCancelEdit.hidden = true;
    } else {
      state.editingId = editId;
      els.fieldId.value = String(editId);
      els.fieldName.value = workout.name;
      els.fieldMuscle.value = workout.muscle;
      els.fieldLevel.value = workout.level;
      els.fieldEquipment.value = workout.equipment;
      els.fieldStatus.value = workout.status || 'active';
      els.fieldSets.value = workout.sets;
      els.fieldReps.value = workout.reps;
      els.fieldDuration.value = workout.duration || 0;
      els.fieldDescription.value = workout.description;
      els.formTitle.textContent = `✏️ แก้ไข: ${workout.name}`;
      els.formSub.textContent = `กำลังแก้ไขรายการ ID: ${editId} — บันทึกเพื่อส่ง PATCH ไปยัง /api/workouts/${editId}`;
      els.btnSubmit.textContent = '💾 บันทึกการแก้ไข';
      els.btnCancelEdit.hidden = false;
      document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    clearAllErrors();
  }

  function resetForm() {
    els.form.reset();
    setFormMode(null);
    selectPreset(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearAllErrors();

    const data = getFormData();
    const isEdit = state.editingId !== null;

    const clientErrors = validateForm(data, isEdit);
    if (Object.keys(clientErrors).length > 0) {
      Object.entries(clientErrors).forEach(([f, m]) => setFieldError(f, m));
      showToast('กรุณาตรวจสอบข้อมูลที่กรอกให้ครบถ้วน', 'error');
      return;
    }

    els.btnSubmit.disabled = true;
    const originalText = els.btnSubmit.textContent;
    els.btnSubmit.textContent = isEdit ? '⏳ กำลังบันทึก...' : '⏳ กำลังเพิ่ม...';

    try {
      if (isEdit) {
        // PATCH /api/workouts/:id
        await apiFetch(`${API_BASE}/workouts/${state.editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(data)
        });
        showToast(`อัปเดต "${data.name}" สำเร็จ (PATCH)`, 'success');
      } else {
        // POST /api/workouts
        await apiFetch(`${API_BASE}/workouts`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        showToast(`เพิ่ม "${data.name}" สำเร็จ (POST)`, 'success');
      }
      resetForm();
      await loadWorkouts();
    } catch (err) {
      showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
      if (err.fields && err.fields.length) {
        err.fields.forEach((f) => {
          const m = f.match(/"([^"]+)"/);
          if (m) setFieldError(m[1], f);
        });
      }
    } finally {
      els.btnSubmit.disabled = false;
      els.btnSubmit.textContent = originalText;
    }
  }

  // ---------------------------------------------------------------------
  // Render List
  // ---------------------------------------------------------------------
  function renderWorkouts(items) {
    if (!items.length) {
      els.list.innerHTML = `
        <div class="state-box">
          <div class="state-icon">🧘</div>
          <h3>ไม่พบท่าออกกำลังกายที่ตรงเงื่อนไข</h3>
          <p>ลองเปลี่ยนตัวกรอง หรือเพิ่มท่าใหม่จากฟอร์มด้านบน</p>
        </div>`;
      return;
    }

    els.list.innerHTML = items
      .map((w) => {
        const muscle = w.muscle || 'unknown';
        const level = w.level || 'beginner';
        const status = w.status || 'active';
        const icon = EQUIPMENT_ICONS[w.equipment] || '🏋️';
        const accentVar = `var(--${muscle === 'full-body' ? 'fullbody' : muscle}, var(--accent))`;

        const volume =
          w.duration > 0
            ? `${w.sets} × ${w.duration}s`
            : `${w.sets} × ${w.reps}`;

        return `
        <article class="card" style="--card-accent: ${accentVar};" data-id="${w.id}">
          <div class="card-head">
            <div>
              <span class="card-id">ID: ${w.id}</span>
              <h3 class="card-title">${icon} ${escapeHtml(w.name)}</h3>
            </div>
            <span class="badge status-${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span>
          </div>

          <div class="badge-row">
            <span class="badge badge-muscle muscle-${escapeHtml(muscle)}">${escapeHtml(MUSCLE_LABELS[muscle] || muscle)}</span>
            <span class="badge level-${escapeHtml(level)}">${escapeHtml(LEVEL_LABELS[level] || level)}</span>
            <span class="badge status-${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span>
          </div>

          <p class="card-desc">${escapeHtml(w.description)}</p>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Sets</span>
              <span class="meta-value">${escapeHtml(w.sets)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${w.duration > 0 ? 'Seconds' : 'Reps'}</span>
              <span class="meta-value">${escapeHtml(w.duration > 0 ? w.duration : w.reps)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Volume</span>
              <span class="meta-value">${escapeHtml(volume)}</span>
            </div>
          </div>

          <div class="card-actions">
            <button type="button" class="btn btn-sm btn-toggle" data-action="toggle" data-id="${w.id}">
              🔄 เปลี่ยนสถานะ
            </button>
            <button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${w.id}">
              ✏️ แก้ไข
            </button>
            <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${w.id}">
              🗑️ ลบ
            </button>
          </div>
        </article>`;
      })
      .join('');
  }

  function renderActiveFilters() {
    const chips = [];
    if (els.filterMuscle.value !== 'all') {
      chips.push(`กลุ่มกล้ามเนื้อ: ${MUSCLE_LABELS[els.filterMuscle.value] || els.filterMuscle.value}`);
    }
    if (els.filterLevel.value !== 'all') {
      chips.push(`ระดับ: ${LEVEL_LABELS[els.filterLevel.value]}`);
    }
    if (els.filterStatus.value !== 'all') {
      chips.push(`สถานะ: ${STATUS_LABELS[els.filterStatus.value]}`);
    }
    if (els.filterSearch.value.trim()) {
      chips.push(`ค้นหา: "${els.filterSearch.value.trim()}"`);
    }
    els.activeFilters.innerHTML = chips
      .map((c) => `<span class="fchip">🔎 ${escapeHtml(c)}</span>`)
      .join('');
  }

  // ---------------------------------------------------------------------
  // Load / Filter
  // ---------------------------------------------------------------------
  async function loadWorkouts() {
    const params = new URLSearchParams();
    if (els.filterMuscle.value && els.filterMuscle.value !== 'all') {
      params.set('muscle', els.filterMuscle.value);
    }
    if (els.filterLevel.value && els.filterLevel.value !== 'all') {
      params.set('level', els.filterLevel.value);
    }
    if (els.filterStatus.value && els.filterStatus.value !== 'all') {
      params.set('status', els.filterStatus.value);
    }
    if (els.filterSearch.value.trim()) {
      params.set('q', els.filterSearch.value.trim());
    }

    const query = params.toString();
    els.listCount.textContent = '⏳ กำลังโหลดข้อมูล...';

    try {
      // GET /api/workouts พร้อม query parameter
      const res = await apiFetch(`${API_BASE}/workouts${query ? `?${query}` : ''}`);
      state.workouts = res.data || [];
      renderWorkouts(state.workouts);
      els.listCount.textContent = `แสดง ${res.count} จาก ${res.count} รายการที่ตรงเงื่อนไข`;
      renderActiveFilters();
    } catch (err) {
      els.list.innerHTML = `
        <div class="state-box">
          <div class="state-icon">📡</div>
          <h3>เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ</h3>
          <p>${escapeHtml(err.message)} — กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่หรือไม่</p>
        </div>`;
      els.listCount.textContent = 'โหลดข้อมูลไม่สำเร็จ';
      showToast(`โหลดข้อมูลไม่สำเร็จ: ${err.message}`, 'error');
    }

    // นับสถิติจากข้อมูลทั้งหมด (ไม่ผ่านตัวกรอง)
    await loadStats();
  }

  async function loadStats() {
    try {
      const res = await apiFetch(`${API_BASE}/workouts`);
      els.statTotal.textContent = res.count;
      els.statActive.textContent = (res.data || []).filter((w) => w.status === 'active').length;
    } catch (e) {
      /* ไม่ต้องทำอะไร */
    }
  }

  // ---------------------------------------------------------------------
  // Actions: PATCH / DELETE
  // ---------------------------------------------------------------------
  async function toggleStatus(id) {
    const workout = state.workouts.find((w) => String(w.id) === String(id));
    if (!workout) return;

    const order = ['active', 'paused', 'archived'];
    const next = order[(order.indexOf(workout.status || 'active') + 1) % order.length];

    try {
      // PATCH /api/workouts/:id
      const res = await apiFetch(`${API_BASE}/workouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next })
      });
      showToast(`เปลี่ยนสถานะ "${workout.name}" เป็น ${STATUS_LABELS[next]} (PATCH)`, 'success');
      if (state.editingId === id) setFormMode(id, res.data);
      await loadWorkouts();
    } catch (err) {
      showToast(`เปลี่ยนสถานะไม่สำเร็จ: ${err.message}`, 'error');
    }
  }

  function startEdit(id) {
    const workout = state.workouts.find((w) => String(w.id) === String(id));
    if (!workout) return;
    setFormMode(workout.id, workout);
    showToast(`เปิดโหมดแก้ไข "${workout.name}" — กดบันทึกเพื่อส่ง PATCH`, 'info');
  }

  function askDelete(id) {
    const workout = state.workouts.find((w) => String(w.id) === String(id));
    if (!workout) return;
    state.deleteTargetId = id;
    els.confirmText.innerHTML = `คุณต้องการลบท่า <strong>${escapeHtml(workout.name)}</strong> (ID: ${id}) ใช่หรือไม่?`;
    els.confirmModal.hidden = false;
  }

  function closeConfirm() {
    els.confirmModal.hidden = true;
    state.deleteTargetId = null;
  }

  async function doDelete() {
    const id = state.deleteTargetId;
    closeConfirm();
    if (id === null) return;

    try {
      // DELETE /api/workouts/:id
      await apiFetch(`${API_BASE}/workouts/${id}`, { method: 'DELETE' });
      showToast(`ลบรายการ ID: ${id} สำเร็จ (204 No Content)`, 'success');
      if (state.editingId === id) resetForm();
      await loadWorkouts();
    } catch (err) {
      showToast(`ลบไม่สำเร็จ: ${err.message}`, 'error');
    }
  }

  // ---------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------
  function bindEvents() {
    els.form.addEventListener('submit', handleSubmit);

    els.btnCancelEdit.addEventListener('click', () => {
      resetForm();
      showToast('ยกเลิกการแก้ไขแล้ว', 'info');
    });

    els.presetSelect.addEventListener('change', (e) => selectPreset(e.target.value));
    els.btnLoadPreset.addEventListener('click', () => applyPresetToForm(els.presetSelect.value, true));
    els.btnClearPreset.addEventListener('click', () => {
      resetForm();
      showToast('ล้างฟอร์มเรียบร้อย', 'info');
    });

    els.filterMuscle.addEventListener('change', loadWorkouts);
    els.filterLevel.addEventListener('change', loadWorkouts);
    els.filterStatus.addEventListener('change', loadWorkouts);

    els.filterSearch.addEventListener('input', () => {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(loadWorkouts, 350);
    });

    els.btnResetFilter.addEventListener('click', () => {
      els.filterMuscle.value = 'all';
      els.filterLevel.value = 'all';
      els.filterStatus.value = 'all';
      els.filterSearch.value = '';
      loadWorkouts();
      showToast('ล้างตัวกรองแล้ว', 'info');
    });

    // Event Delegation สำหรับปุ่มในการ์ด
    els.list.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'edit') startEdit(id);
      else if (action === 'delete') askDelete(id);
      else if (action === 'toggle') toggleStatus(id);
    });

    els.confirmOk.addEventListener('click', doDelete);
    els.confirmCancel.addEventListener('click', closeConfirm);
    els.confirmModal.addEventListener('click', (e) => {
      if (e.target === els.confirmModal) closeConfirm();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !els.confirmModal.hidden) closeConfirm();
    });

    // ล้าง error เมื่อผู้ใช้เริ่มพิมพ์
    els.form.addEventListener('input', (e) => {
      if (e.target.name) setFieldError(e.target.name, '');
    });
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  function init() {
    renderPresets();
    bindEvents();
    setFormMode(null);
    loadWorkouts();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
