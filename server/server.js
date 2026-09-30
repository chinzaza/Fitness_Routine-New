/**
 * Workout Routine Catalog - Server
 * --------------------------------
 * REST API ด้วย Node.js + Express เก็บข้อมูลใน Memory DB (In-Memory Array)
 * รองรับ CRUD 5 endpoints + การกรองข้อมูลด้วย query parameter
 */

'use strict';

const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เปิดใช้งาน CORS (ไม่จำเป็นสำหรับ static แต่ช่วยตอนทดสอบ API จากเครื่องอื่น)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---------------------------------------------------------------------------
// Constants / Schema Reference
// ---------------------------------------------------------------------------
const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'core', 'shoulders', 'arms', 'full-body'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const STATUSES = ['active', 'paused', 'archived'];

/** ฟิลด์ที่บังคับต้องมีตอนสร้างรายการใหม่ */
const REQUIRED_FIELDS = ['name', 'muscle', 'level', 'equipment', 'sets', 'reps', 'description'];

// ---------------------------------------------------------------------------
// In-Memory Database (Seed Data 6-8 รายการ)
// ---------------------------------------------------------------------------
let workouts = [
  {
    id: 1,
    name: 'Push-up',
    muscle: 'chest',
    level: 'beginner',
    equipment: 'bodyweight',
    sets: 3,
    reps: 12,
    duration: 0,
    description: 'วิ่งออกกำลังกายช่วงอกและแขน โดยวางมือกว้างกว่าไหล่ ลดตัวจนลำตัวเป็นเส้นตรง',
    status: 'active',
    createdAt: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 2,
    name: 'Bench Press',
    muscle: 'chest',
    level: 'intermediate',
    equipment: 'barbell',
    sets: 4,
    reps: 8,
    duration: 0,
    description: 'นอนบนม้าแล้วกดเหล็กลงจนแตะหน้าอก ดันขึ้นจนแขนตั้งตรง ควบคุมน้ำหนักเหล็กให้เหมาะสม',
    status: 'active',
    createdAt: '2026-01-05T08:05:00.000Z'
  },
  {
    id: 3,
    name: 'Squat',
    muscle: 'legs',
    level: 'intermediate',
    equipment: 'barbell',
    sets: 5,
    reps: 5,
    duration: 0,
    description: 'ยืดตัวลงให้ต้องขาอยู่ระดับเข่า หลังตรงและก้นถอยไปหลัง ดันกลับขึ้นยืน',
    status: 'active',
    createdAt: '2026-01-05T08:10:00.000Z'
  },
  {
    id: 4,
    name: 'Pull-up',
    muscle: 'back',
    level: 'advanced',
    equipment: 'bodyweight',
    sets: 3,
    reps: 8,
    duration: 0,
    description: 'แขวนบนบาร์ ดึงแคนตามเข้าหาเหนือหัว ใช้แขนและหลังดึงลำตัวขึ้น',
    status: 'active',
    createdAt: '2026-01-05T08:15:00.000Z'
  },
  {
    id: 5,
    name: 'Plank',
    muscle: 'core',
    level: 'beginner',
    equipment: 'bodyweight',
    sets: 3,
    reps: 1,
    duration: 60,
    description: 'วางฝ่ามือและปลายเท้าลงพื้น ลำตัวเป็นเส้นตรงตั้งแต่หัวถึงส้นเท้า ค้างไว้ตามเวลาที่กำหนด',
    status: 'active',
    createdAt: '2026-01-05T08:20:00.000Z'
  },
  {
    id: 6,
    name: 'Deadlift',
    muscle: 'legs',
    level: 'advanced',
    equipment: 'barbell',
    sets: 3,
    reps: 5,
    duration: 0,
    description: 'ยืนก่อนแท่นเหล็ก ยกเหล็กจากพื้นด้วยแรงขาและหลัง เอาตัวขึ้นจนยืนตรงเต็มตัว',
    status: 'active',
    createdAt: '2026-01-05T08:25:00.000Z'
  },
  {
    id: 7,
    name: 'Burpee',
    muscle: 'full-body',
    level: 'intermediate',
    equipment: 'bodyweight',
    sets: 4,
    reps: 10,
    duration: 0,
    description: 'อย่าลงแต่ละท่าตามลำดับ: ยืน - นั่งลง - คลานลงพื้น - ดันขึ้น - กระโดดขึ้น',
    status: 'active',
    createdAt: '2026-01-05T08:30:00.000Z'
  },
  {
    id: 8,
    name: 'Lunges',
    muscle: 'legs',
    level: 'beginner',
    equipment: 'bodyweight',
    sets: 3,
    reps: 12,
    duration: 0,
    description: 'ก้าวไปข้างหน้า 1 ก้าว ลดตัวลงจนเข่าหน้าลงระดับพื้น แล้วดันกลับขึ้นยืนที่เดิม',
    status: 'paused',
    createdAt: '2026-01-05T08:35:00.000Z'
  }
];

let nextId = 9;

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** สร้าง id ถัดไปแบบไม่ชนกับข้อมูลเดิม */
function generateId() {
  while (workouts.some((w) => w.id === nextId)) {
    nextId += 1;
  }
  const id = nextId;
  nextId += 1;
  return id;
}

/**
 * ตรวจสอบและแปลงข้อมูลก่อนบันทึก
 * @returns {{ valid: boolean, errors: string[], value: object }}
 */
function validateWorkout(body, { partial = false } = {}) {
  const errors = [];
  const value = {};

  // ตรวจฟิลด์บังคับ
  for (const field of REQUIRED_FIELDS) {
    if (partial && !Object.prototype.hasOwnProperty.call(body, field)) continue;

    const raw = body[field];
    if (raw === undefined || raw === null || String(raw).trim() === '') {
      errors.push(`ฟิลด์ "${field}" เป็นข้อมูลจำเป็นและห้ามเว้นว่าง`);
    }
  }

  // name
  if (body.name !== undefined && String(body.name ?? '').trim() !== '') {
    const name = String(body.name).trim();
    if (name.length > 80) errors.push('ชื่อท่าต้องไม่เกิน 80 ตัวอักษร');
    value.name = name;
  }

  // muscle
  if (body.muscle !== undefined && String(body.muscle ?? '').trim() !== '') {
    const muscle = String(body.muscle).trim().toLowerCase();
    if (!MUSCLE_GROUPS.includes(muscle)) {
      errors.push(`muscle ต้องเป็นหนึ่งใน: ${MUSCLE_GROUPS.join(', ')}`);
    } else {
      value.muscle = muscle;
    }
  }

  // level
  if (body.level !== undefined && String(body.level ?? '').trim() !== '') {
    const level = String(body.level).trim().toLowerCase();
    if (!LEVELS.includes(level)) {
      errors.push(`level ต้องเป็นหนึ่งใน: ${LEVELS.join(', ')}`);
    } else {
      value.level = level;
    }
  }

  // status
  if (body.status !== undefined && String(body.status ?? '').trim() !== '') {
    const status = String(body.status).trim().toLowerCase();
    if (!STATUSES.includes(status)) {
      errors.push(`status ต้องเป็นหนึ่งใน: ${STATUSES.join(', ')}`);
    } else {
      value.status = status;
    }
  }

  // equipment
  if (body.equipment !== undefined && String(body.equipment ?? '').trim() !== '') {
    value.equipment = String(body.equipment).trim().toLowerCase();
  }

  // sets
  if (body.sets !== undefined && String(body.sets).trim() !== '') {
    const sets = Number(body.sets);
    if (!Number.isInteger(sets) || sets < 1 || sets > 20) {
      errors.push('sets ต้องเป็นจำนวนเต็มระหว่าง 1-20');
    } else {
      value.sets = sets;
    }
  }

  // reps
  if (body.reps !== undefined && String(body.reps).trim() !== '') {
    const reps = Number(body.reps);
    if (!Number.isInteger(reps) || reps < 1 || reps > 200) {
      errors.push('reps ต้องเป็นจำนวนเต็มระหว่าง 1-200');
    } else {
      value.reps = reps;
    }
  }

  // duration (นาที) - ไม่บังคับ
  if (body.duration !== undefined && String(body.duration ?? '').trim() !== '') {
    const duration = Number(body.duration);
    if (!Number.isFinite(duration) || duration < 0) {
      errors.push('duration ต้องเป็นตัวเลขที่ไม่ติดลบ (หน่วยวินาที)');
    } else {
      value.duration = Math.round(duration);
    }
  }

  // description
  if (body.description !== undefined && String(body.description ?? '').trim() !== '') {
    const description = String(body.description).trim();
    if (description.length > 500) errors.push('description ต้องไม่เกิน 500 ตัวอักษร');
    value.description = description;
  }

  return { valid: errors.length === 0, errors, value };
}

/** สร้าง id จากพารามิเตอร์ :id */
function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

// ---------------------------------------------------------------------------
// API: GET /api/workouts  (อ่านทั้งหมด + กรองตาม query parameter)
// ---------------------------------------------------------------------------
app.get('/api/workouts', (req, res) => {
  const { muscle, level, equipment, status, q } = req.query;
  let result = workouts;

  if (muscle && muscle !== 'all') {
    result = result.filter((w) => String(w.muscle).toLowerCase() === String(muscle).toLowerCase());
  }
  if (level && level !== 'all') {
    result = result.filter((w) => String(w.level).toLowerCase() === String(level).toLowerCase());
  }
  if (equipment && equipment !== 'all') {
    result = result.filter(
      (w) => String(w.equipment).toLowerCase() === String(equipment).toLowerCase()
    );
  }
  if (status && status !== 'all') {
    result = result.filter((w) => String(w.status).toLowerCase() === String(status).toLowerCase());
  }
  if (q) {
    const keyword = String(q).trim().toLowerCase();
    result = result.filter(
      (w) =>
        String(w.name).toLowerCase().includes(keyword) ||
        String(w.description).toLowerCase().includes(keyword) ||
        String(w.equipment).toLowerCase().includes(keyword)
    );
  }

  console.log(`[GET] /api/workouts -> พบ ${result.length} รายการ`, {
    muscle,
    level,
    equipment,
    status,
    q
  });

  res.status(200).json({
    success: true,
    count: result.length,
    filters: { muscle: muscle || 'all', level: level || 'all', equipment: equipment || 'all', status: status || 'all', q: q || '' },
    data: result
  });
});

// ---------------------------------------------------------------------------
// API: GET /api/workouts/:id  (อ่านรายการเดียว)
// ---------------------------------------------------------------------------
app.get('/api/workouts/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID ต้องเป็นตัวเลขจำนวนเต็ม' });
  }

  const workout = workouts.find((w) => w.id === id);
  if (!workout) {
    console.log(`[GET] /api/workouts/${id} -> 404 Not Found`);
    return res.status(404).json({ success: false, error: `ไม่พบท่าออกกำลังกาย ID: ${id}` });
  }

  console.log(`[GET] /api/workouts/${id} -> 200 OK (${workout.name})`);
  res.status(200).json({ success: true, data: workout });
});

// ---------------------------------------------------------------------------
// API: POST /api/workouts  (สร้างใหม่)
// ---------------------------------------------------------------------------
app.post('/api/workouts', (req, res) => {
  const body = req.body || {};
  const { valid, errors, value } = validateWorkout(body, { partial: false });

  if (!valid) {
    console.log('[POST] /api/workouts -> 400 Bad Request:', errors);
    return res.status(400).json({
      success: false,
      error: 'ข้อมูลที่ส่งมาไม่ครบถ้วนหรือไม่ถูกต้อง',
      fields: errors
    });
  }

  const workout = {
    id: generateId(),
    name: value.name,
    muscle: value.muscle,
    level: value.level,
    equipment: value.equipment || 'bodyweight',
    sets: value.sets,
    reps: value.reps,
    duration: value.duration || 0,
    description: value.description,
    status: value.status || 'active',
    createdAt: new Date().toISOString()
  };

  workouts.push(workout);
  console.log(`[POST] /api/workouts -> 201 Created (ID: ${workout.id} - ${workout.name})`);
  res.status(201).json({ success: true, message: 'เพิ่มท่าออกกำลังกายสำเร็จ', data: workout });
});

// ---------------------------------------------------------------------------
// API: PATCH /api/workouts/:id  (อัปเดตบางส่วน)
// ---------------------------------------------------------------------------
app.patch('/api/workouts/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID ต้องเป็นตัวเลขจำนวนเต็ม' });
  }

  const index = workouts.findIndex((w) => w.id === id);
  if (index === -1) {
    console.log(`[PATCH] /api/workouts/${id} -> 404 Not Found`);
    return res.status(404).json({ success: false, error: `ไม่พบท่าออกกำลังกาย ID: ${id}` });
  }

  const body = req.body || {};
  const { valid, errors, value } = validateWorkout(body, { partial: true });

  if (!valid) {
    console.log(`[PATCH] /api/workouts/${id} -> 400 Bad Request:`, errors);
    return res.status(400).json({
      success: false,
      error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
      fields: errors
    });
  }

  if (Object.keys(value).length === 0) {
    return res.status(400).json({ success: false, error: 'ไม่พบฟิลด์ที่ต้องการอัปเดต' });
  }

  workouts[index] = { ...workouts[index], ...value, id: workouts[index].id };
  console.log(`[PATCH] /api/workouts/${id} -> 200 OK`, value);
  res.status(200).json({
    success: true,
    message: 'อัปเดตข้อมูลสำเร็จ',
    data: workouts[index]
  });
});

// ---------------------------------------------------------------------------
// API: DELETE /api/workouts/:id  (ลบรายการ)
// ---------------------------------------------------------------------------
app.delete('/api/workouts/:id', (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID ต้องเป็นตัวเลขจำนวนเต็ม' });
  }

  const index = workouts.findIndex((w) => w.id === id);
  if (index === -1) {
    console.log(`[DELETE] /api/workouts/${id} -> 404 Not Found`);
    return res.status(404).json({ success: false, error: `ไม่พบท่าออกกำลังกาย ID: ${id}` });
  }

  const [removed] = workouts.splice(index, 1);
  console.log(`[DELETE] /api/workouts/${id} -> 204 No Content (${removed.name})`);
  res.status(204).send();
});

// ---------------------------------------------------------------------------
// API: Metadata (ใช้สร้าง Dropdown ฝั่ง Client)
// ---------------------------------------------------------------------------
app.get('/api/meta', (req, res) => {
  res.status(200).json({
    success: true,
    data: { muscles: MUSCLE_GROUPS, levels: LEVELS, statuses: STATUSES, requiredFields: REQUIRED_FIELDS }
  });
});

// ---------------------------------------------------------------------------
// 404 handler สำหรับ API ที่ไม่มีอยู่จริง
// ---------------------------------------------------------------------------
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `ไม่พบ API นี้: ${req.method} ${req.originalUrl}` });
});

// ---------------------------------------------------------------------------
// Static Files (index.html, style.css, app.js)
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'รูปแบบ JSON ไม่ถูกต้อง' });
  }
  res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Workout Routine Catalog API');
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Client (UI)      : http://localhost:${PORT}`);
  console.log(`  Seed data loaded : ${workouts.length} รายการ`);
  console.log('='.repeat(60));
});

module.exports = app;
