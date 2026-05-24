/* =============================================================
   VRpatients Persona Questionnaire — app.js
   Vanilla JS. No dependencies.
   ============================================================= */

(() => {
  'use strict';

  const PERSONA_ROWS = ['tasha', 'paula', 'dale', 'carla', 'riley', 'greg'];

  const state = {
    currentStepIdx: 0,
    // Step IDs in active sequence. Recomputed when role is set.
    // 0=intro/personas, 1=details, 2=rankings, 3=role battery, 4=open text, 5=Calendly.
    // OTHER skips step 3 (role-specific battery).
    steps: [0, 1, 2, 3, 4, 5],
    role: null,                // 'PM' | 'SALES' | 'CS' | 'OTHER' | null
    skipped: new Set(),
  };

  const form = document.getElementById('vrp-form');
  const hero = document.getElementById('hero');
  const progress = document.getElementById('progress');
  const progressLabel = document.getElementById('progress-label');
  const progressTrack = document.getElementById('progress-track');
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');
  const confirmation = document.getElementById('confirmation');

  /* -----------------------------------------------------------
     Personas — inject template into intro + modal slots, wire modal
     ----------------------------------------------------------- */
  const personasTemplate = document.getElementById('personas-template');
  document.querySelectorAll('[data-personas-slot]').forEach(slot => {
    slot.appendChild(personasTemplate.content.cloneNode(true));
  });

  const personasModal = document.getElementById('personas-modal');
  const personasFab = document.getElementById('personas-fab');
  let lastFocusedBeforeModal = null;

  function openPersonasModal() {
    lastFocusedBeforeModal = document.activeElement;
    personasModal.hidden = false;
    personasModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // Move focus to close button
    requestAnimationFrame(() => {
      personasModal.querySelector('.personas-modal__close')?.focus();
    });
  }

  function closePersonasModal() {
    personasModal.hidden = true;
    personasModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
  }

  document.getElementById('open-personas').addEventListener('click', openPersonasModal);
  personasFab.addEventListener('click', openPersonasModal);
  document.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', closePersonasModal);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !personasModal.hidden) closePersonasModal();
  });

  /* -----------------------------------------------------------
     URL parameter pre-fill (?name=)
     ----------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const nameParam = params.get('name');
  if (nameParam) {
    const nameInput = document.getElementById('S0_01');
    if (nameInput) nameInput.value = nameParam.trim();
  }

  /* -----------------------------------------------------------
     Role routing — enable correct battery, disable others
     ----------------------------------------------------------- */
  function setRole(role) {
    state.role = role;
    document.getElementById('hidden-battery').value = role === 'OTHER' ? '' : role;

    // Show/hide + enable/disable batteries
    document.querySelectorAll('.battery').forEach(b => {
      const isMatch = b.dataset.battery === role;
      b.hidden = !isMatch;
      // Inputs in inactive batteries must be disabled so Netlify doesn't POST them
      b.querySelectorAll('input, textarea').forEach(inp => {
        inp.disabled = !isMatch;
      });
    });

    // Recompute active step sequence — OTHER skips the role-specific battery (step 3)
    state.steps = role === 'OTHER' ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];

    // Show/hide S0_03 options — checkboxes for roles NOT chosen in S0_02
    const crossOpts = document.querySelectorAll('#S0_03-options [data-cross-role]');
    crossOpts.forEach(input => {
      const li = input.closest('li');
      const isSameRole = role !== 'OTHER' && input.dataset.crossRole === role;
      li.hidden = isSameRole;
      // If we're hiding it, also uncheck it
      if (isSameRole) input.checked = false;
    });

    renderProgress();
  }

  document.querySelectorAll('input[name="S0_02"]').forEach(r => {
    r.addEventListener('change', e => setRole(e.target.value));
  });

  /* -----------------------------------------------------------
     Conditional fields (show/hide + enable/disable child inputs)
     ----------------------------------------------------------- */
  function refreshConditional(triggerId, shouldShow) {
    const cond = document.getElementById(triggerId);
    if (!cond) return;
    cond.hidden = !shouldShow;
    cond.querySelectorAll('input, textarea').forEach(inp => {
      inp.disabled = !shouldShow;
      if (!shouldShow) {
        inp.value = '';
        // Clear any error state
        const field = inp.closest('.field') || cond;
        field.classList.remove('field--error');
      }
    });
  }

  // For every radio GROUP that has at least one [data-conditional] member,
  // attach the same handler to ALL radios in the group — otherwise switching
  // from a conditional-bearing option to a non-conditional one wouldn't fire.
  const radioGroupsWithConditional = new Set();
  document.querySelectorAll('input[type="radio"][data-conditional]').forEach(r => {
    radioGroupsWithConditional.add(r.name);
  });
  radioGroupsWithConditional.forEach(groupName => {
    document.querySelectorAll(`input[type="radio"][name="${groupName}"]`).forEach(r => {
      r.addEventListener('change', () => {
        // Hide all conditionals tied to this group
        document.querySelectorAll(`input[type="radio"][name="${groupName}"][data-conditional]`).forEach(other => {
          refreshConditional(other.dataset.conditional, false);
        });
        // Show the one for the checked radio (if any)
        const checked = document.querySelector(`input[type="radio"][name="${groupName}"]:checked`);
        if (checked && checked.dataset.conditional) {
          refreshConditional(checked.dataset.conditional, true);
        }
      });
    });
  });

  // Checkboxes with data-conditional
  document.querySelectorAll('input[type="checkbox"][data-conditional]').forEach(input => {
    input.addEventListener('change', () => {
      refreshConditional(input.dataset.conditional, input.checked);
    });
  });

  /* -----------------------------------------------------------
     S0_02 OTHER — show "Your role" text field
     ----------------------------------------------------------- */
  document.querySelectorAll('input[name="S0_02"]').forEach(r => {
    r.addEventListener('change', () => {
      const isOther = document.querySelector('input[name="S0_02"]:checked')?.value === 'OTHER';
      refreshConditional('cond-S0_02-other', isOther);
      if (!isOther) document.getElementById('hidden-other-role').value = '';
    });
  });
  document.getElementById('S0_02_other').addEventListener('input', e => {
    document.getElementById('hidden-other-role').value = e.target.value;
  });

  /* -----------------------------------------------------------
     S2_SALES_01 — limit to 2 checkboxes
     ----------------------------------------------------------- */
  const salesQ1Checks = document.querySelectorAll('input[name="S2_SALES_01"]');
  salesQ1Checks.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = [...salesQ1Checks].filter(c => c.checked);
      if (checked.length > 2) cb.checked = false;
    });
  });

  /* -----------------------------------------------------------
     Matrix mobile ↔ desktop sync
     Mobile inputs are named with _m suffix. On change in either,
     mirror to the matched canonical name. On submit we disable
     the _m copies so only the canonical names POST.
     ----------------------------------------------------------- */
  PERSONA_ROWS.forEach(p => {
    const desktopName = `S0_04_${p}`;
    const mobileName = `${desktopName}_m`;
    document.querySelectorAll(`input[name="${desktopName}"]`).forEach(r => {
      r.addEventListener('change', () => {
        const m = document.querySelector(`input[name="${mobileName}"][value="${r.value}"]`);
        if (m) m.checked = true;
      });
    });
    document.querySelectorAll(`input[name="${mobileName}"]`).forEach(r => {
      r.addEventListener('change', () => {
        const d = document.querySelector(`input[name="${desktopName}"][value="${r.value}"]`);
        if (d) d.checked = true;
      });
    });
  });

  /* -----------------------------------------------------------
     Skip handling
     ----------------------------------------------------------- */
  document.querySelectorAll('[data-skip-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.field');
      const qid = field.dataset.qid;
      field.classList.add('is-skipped');
      field.classList.remove('field--error');
      // Clear inputs
      field.querySelectorAll('input, textarea').forEach(inp => {
        if (inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false;
        else if (inp.tagName === 'TEXTAREA' || inp.type === 'text') inp.value = '';
      });
      state.skipped.add(qid);
      updateSkipHiddenFields();
    });
  });

  document.querySelectorAll('[data-undo-skip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.field');
      const qid = field.dataset.qid;
      field.classList.remove('is-skipped');
      state.skipped.delete(qid);
      updateSkipHiddenFields();
    });
  });

  function updateSkipHiddenFields() {
    const arr = [...state.skipped];
    document.getElementById('hidden-skipped').value = arr.join(',');
    document.getElementById('hidden-pm-alert').value =
      state.role === 'PM' && arr.some(q => q.startsWith('S2_PM_')) ? 'true' : 'false';
    document.getElementById('hidden-cs-alert').value =
      state.role === 'CS' && arr.some(q => q.startsWith('S2_CS_')) ? 'true' : 'false';
  }

  /* -----------------------------------------------------------
     Forced-rank widget — pointer-event drag + keyboard arrows
     ----------------------------------------------------------- */
  const rankList = document.getElementById('rank-list');
  let drag = null; // { item, startY, startIndex, itemHeight }

  function rankItems() {
    return [...rankList.querySelectorAll('.rank__item')];
  }

  function updateRankNumbers() {
    rankItems().forEach((item, i) => {
      item.querySelector('.rank__num').textContent = String(i + 1);
    });
  }

  function writeRankHidden() {
    const order = rankItems().map(item => item.dataset.persona);
    document.getElementById('S1_01_rank').value = order.join(',');
  }

  function commitRank() {
    updateRankNumbers();
    writeRankHidden();
  }

  rankList.addEventListener('pointerdown', e => {
    const item = e.target.closest('.rank__item');
    if (!item) return;
    e.preventDefault();
    const items = rankItems();
    const itemHeight = item.getBoundingClientRect().height + 8; // approx incl gap
    drag = {
      item,
      startY: e.clientY,
      startIndex: items.indexOf(item),
      itemHeight,
      pointerId: e.pointerId,
    };
    item.classList.add('is-dragging');
    item.setPointerCapture(e.pointerId);
  });

  rankList.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const deltaY = e.clientY - drag.startY;
    drag.item.style.transform = `translateY(${deltaY}px)`;

    const items = rankItems();
    const currentIndex = items.indexOf(drag.item);
    const targetIndex = Math.max(
      0,
      Math.min(items.length - 1, drag.startIndex + Math.round(deltaY / drag.itemHeight))
    );

    if (targetIndex !== currentIndex) {
      // Move in DOM
      const ref = items[targetIndex > currentIndex ? targetIndex + 1 : targetIndex];
      rankList.insertBefore(drag.item, ref ?? null);
      // Reset baseline so further movement is relative to new position
      drag.startIndex = targetIndex;
      drag.startY = e.clientY;
      drag.item.style.transform = 'translateY(0)';
    }
  });

  function endDrag(e) {
    if (!drag) return;
    drag.item.classList.remove('is-dragging');
    drag.item.style.transform = '';
    if (drag.item.hasPointerCapture && drag.item.hasPointerCapture(drag.pointerId)) {
      drag.item.releasePointerCapture(drag.pointerId);
    }
    drag = null;
    commitRank();
  }
  rankList.addEventListener('pointerup', endDrag);
  rankList.addEventListener('pointercancel', endDrag);

  rankList.addEventListener('keydown', e => {
    const item = e.target.closest('.rank__item');
    if (!item) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const items = rankItems();
    const idx = items.indexOf(item);
    const newIdx = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(items.length - 1, idx + 1);
    if (newIdx === idx) return;
    const ref = items[newIdx > idx ? newIdx + 1 : newIdx];
    rankList.insertBefore(item, ref ?? null);
    commitRank();
    item.focus();
  });

  // Initialize the rank hidden value on load (default order)
  commitRank();

  /* -----------------------------------------------------------
     Section navigation + progress rendering
     ----------------------------------------------------------- */
  function currentStepId() {
    return state.steps[state.currentStepIdx];
  }

  function renderProgress() {
    progressTrack.innerHTML = '';
    state.steps.forEach((_, i) => {
      const seg = document.createElement('div');
      seg.className = 'progress__step';
      if (i < state.currentStepIdx) seg.classList.add('progress__step--done');
      if (i === state.currentStepIdx) seg.classList.add('progress__step--active');
      progressTrack.appendChild(seg);
    });
    progressLabel.textContent = `Step ${state.currentStepIdx + 1} of ${state.steps.length}`;
  }

  function showStep(idx) {
    state.currentStepIdx = idx;
    const stepId = currentStepId();

    // Show/hide sections
    document.querySelectorAll('.section').forEach(s => {
      s.hidden = Number(s.dataset.step) !== stepId;
    });

    // Hero (shrunk intro banner) only on step 0 — the "Before you start" page
    hero.hidden = stepId !== 0;
    // Progress bar visible from step 0 onward — sets scope expectations early
    progress.hidden = false;
    // Floating Personas button visible on steps 1+ (step 0 has the intro grid)
    personasFab.hidden = stepId === 0;

    // Nav buttons
    btnBack.hidden = idx === 0;
    const isLast = idx === state.steps.length - 1;
    btnNext.hidden = isLast;
    btnSubmit.hidden = !isLast;

    renderProgress();

    // Focus first input in new section
    const section = document.querySelector(`.section[data-step="${stepId}"]`);
    const focusable = section.querySelector('input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), button:not([disabled])');
    // Slight delay so layout settles before scrolling
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (focusable) focusable.focus({ preventScroll: true });
    });
  }

  btnNext.addEventListener('click', () => {
    if (!validateCurrentSection()) return;
    if (state.currentStepIdx < state.steps.length - 1) {
      showStep(state.currentStepIdx + 1);
    }
  });

  btnBack.addEventListener('click', () => {
    if (state.currentStepIdx > 0) showStep(state.currentStepIdx - 1);
  });

  /* -----------------------------------------------------------
     Validation
     ----------------------------------------------------------- */

  function markError(field, message) {
    field.classList.add('field--error');
    const errEl = field.querySelector('.field__error');
    if (errEl && message) errEl.textContent = message;
  }

  function clearErrors(section) {
    section.querySelectorAll('.field--error').forEach(f => f.classList.remove('field--error'));
  }

  function validateCurrentSection() {
    const stepId = currentStepId();
    const section = document.querySelector(`.section[data-step="${stepId}"]`);
    if (!section) return true;
    clearErrors(section);

    let firstError = null;
    const errorCheck = (field, ok, msg) => {
      if (!ok && !field.classList.contains('is-skipped')) {
        markError(field, msg);
        if (!firstError) firstError = field;
      }
    };

    if (stepId === 0) {
      // Intro/personas page — nothing to validate.
    }

    else if (stepId === 1) {
      // S0_01 name
      const name = document.getElementById('S0_01');
      errorCheck(name.closest('.field'), name.value.trim().length >= 2, 'Please enter your name (2+ characters).');

      // S0_02 role
      const roleChecked = document.querySelector('input[name="S0_02"]:checked');
      errorCheck(document.querySelector('[data-qid="S0_02"]'), !!roleChecked, 'Please select your primary role.');

      // S0_02 OTHER conditional
      if (roleChecked?.value === 'OTHER') {
        const otherInput = document.getElementById('S0_02_other');
        const ok = otherInput.value.trim().length >= 3;
        const condField = document.getElementById('cond-S0_02-other');
        if (!ok) {
          condField.querySelector('.field__error').style.display = 'flex';
          condField.classList.add('field--error');
          if (!firstError) firstError = condField;
        } else {
          condField.classList.remove('field--error');
        }
      }

      // S0_04 matrix — every row needs a value
      const matrixField = document.getElementById('field-S0_04');
      const allRowsAnswered = PERSONA_ROWS.every(p =>
        document.querySelector(`input[name="S0_04_${p}"]:checked`) ||
        document.querySelector(`input[name="S0_04_${p}_m"]:checked`)
      );
      errorCheck(matrixField, allRowsAnswered, 'Please answer every row before continuing.');
    }

    else if (stepId === 2) {
      // S1_01 rank — always populated by widget; verify all 6 personas present and unique
      const order = document.getElementById('S1_01_rank').value.split(',').filter(Boolean);
      const rankOk = order.length === 6 && new Set(order).size === 6;
      errorCheck(document.getElementById('field-S1_01'), rankOk, 'Ranking is incomplete.');

      // S1_02
      errorCheck(
        document.querySelector('[data-qid="S1_02"]'),
        !!document.querySelector('input[name="S1_02"]:checked'),
        'Please choose one.'
      );

      // S1_03
      const s103 = document.querySelector('input[name="S1_03"]:checked');
      errorCheck(document.querySelector('[data-qid="S1_03"]'), !!s103, 'Please choose one.');
      // (S1_03_title is optional, no validation)

      // S1_04
      errorCheck(
        document.querySelector('[data-qid="S1_04"]'),
        !!document.querySelector('input[name="S1_04"]:checked'),
        'Please choose one.'
      );
    }

    else if (stepId === 3) {
      if (state.role === 'SALES') validateSalesBattery(errorCheck);
      else if (state.role === 'CS') validateCsBattery(errorCheck);
      else if (state.role === 'PM') validatePmBattery(errorCheck);
    }

    else if (stepId === 4) {
      const ta = document.querySelector('textarea[name="S3_01"]');
      errorCheck(ta.closest('.field'), ta.value.trim().length >= 20, 'Please share at least one phrase (20+ characters).');
    }

    else if (stepId === 5) {
      // S4_01 notes are optional — booking happens via Calendly embed,
      // and Calendly bookings are tracked in Calendly's own dashboard.
    }

    // Scroll to first error
    if (firstError) {
      const setFocus = () => {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = firstError.querySelector('input:not([disabled]):not([type="hidden"]), textarea:not([disabled])');
        if (focusable) focusable.focus({ preventScroll: true });
      };
      requestAnimationFrame(setFocus);
      return false;
    }
    return true;
  }

  function checked(name) {
    return document.querySelector(`input[name="${name}"]:checked`);
  }
  function checkedAll(name) {
    return document.querySelectorAll(`input[name="${name}"]:checked`);
  }

  function validateSalesBattery(errorCheck) {
    // S2_SALES_01: 1–2 selected
    const c01 = checkedAll('S2_SALES_01');
    errorCheck(document.querySelector('[data-qid="S2_SALES_01"]'), c01.length >= 1 && c01.length <= 2, 'Pick 1–2 options.');

    // S2_SALES_02
    errorCheck(document.querySelector('[data-qid="S2_SALES_02"]'), !!checked('S2_SALES_02'), 'Please choose one.');

    // S2_SALES_03
    errorCheck(document.querySelector('[data-qid="S2_SALES_03"]'), !!checked('S2_SALES_03'), 'Please choose one.');

    // Skip-permitted: 04, 05, 06 — only validate if NOT skipped, and only require if answered
    // Per L4: skip-permitted = skipped OR has answer. So no error if blank+not skipped? Spec says "Skip-permitted or one option selected" for radio types.
    // Interpretation: user MUST either pick or skip — blank without skip is an error.
    const checkSkipPermitted = (qid, hasValue) => {
      const field = document.querySelector(`[data-qid="${qid}"]`);
      const isSkipped = field.classList.contains('is-skipped');
      errorCheck(field, isSkipped || hasValue, 'Please choose one or use the skip button.');
    };
    checkSkipPermitted('S2_SALES_04', !!checked('S2_SALES_04'));
    checkSkipPermitted('S2_SALES_05', !!checked('S2_SALES_05'));
    checkSkipPermitted('S2_SALES_06', !!checked('S2_SALES_06'));
  }

  function validateCsBattery(errorCheck) {
    errorCheck(document.querySelector('[data-qid="S2_CS_01"]'), !!checked('S2_CS_01'), 'Please choose one.');
    errorCheck(document.querySelector('[data-qid="S2_CS_02"]'), !!checked('S2_CS_02'), 'Please choose one.');
    errorCheck(document.querySelector('[data-qid="S2_CS_03"]'), !!checked('S2_CS_03'), 'Please choose one.');

    const checkSkipPermitted = (qid, hasValue, msg) => {
      const field = document.querySelector(`[data-qid="${qid}"]`);
      const isSkipped = field.classList.contains('is-skipped');
      errorCheck(field, isSkipped || hasValue, msg);
    };
    checkSkipPermitted('S2_CS_04', !!checked('S2_CS_04'), 'Please choose one or use the skip button.');

    const cs05 = document.querySelector('textarea[name="S2_CS_05"]');
    checkSkipPermitted('S2_CS_05', cs05.value.trim().length >= 20, 'Please answer (20+ characters) or use the skip button.');

    const cs06 = document.querySelector('textarea[name="S2_CS_06"]');
    checkSkipPermitted('S2_CS_06', cs06.value.trim().length >= 20, 'Please answer (20+ characters) or use the skip button.');
  }

  function validatePmBattery(errorCheck) {
    errorCheck(document.querySelector('[data-qid="S2_PM_01"]'), !!checked('S2_PM_01'), 'Please choose one.');

    // S2_PM_02 — at least one of the two fields has 3+ chars
    const measured = document.getElementById('S2_PM_02_measured').value.trim();
    const estimate = document.getElementById('S2_PM_02_estimate').value.trim();
    errorCheck(
      document.querySelector('[data-qid="S2_PM_02"]'),
      measured.length >= 3 || estimate.length >= 3,
      'Please fill at least one of the two fields (3+ characters).'
    );

    const checkSkipPermitted = (qid, hasValue, msg) => {
      const field = document.querySelector(`[data-qid="${qid}"]`);
      const isSkipped = field.classList.contains('is-skipped');
      errorCheck(field, isSkipped || hasValue, msg);
    };

    const pm03 = document.querySelector('textarea[name="S2_PM_03"]');
    checkSkipPermitted('S2_PM_03', pm03.value.trim().length >= 15, 'Please answer (15+ characters) or use the skip button.');

    const pm04 = document.querySelector('textarea[name="S2_PM_04"]');
    checkSkipPermitted('S2_PM_04', pm04.value.trim().length >= 10, 'Please answer (10+ characters) or use the skip button.');

    checkSkipPermitted('S2_PM_05', !!checked('S2_PM_05'), 'Please choose one or use the skip button.');
  }

  /* -----------------------------------------------------------
     Form submission
     ----------------------------------------------------------- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateCurrentSection()) return;

    // Update timestamp + skip alerts one last time
    document.getElementById('hidden-submitted-at').value = new Date().toISOString();
    updateSkipHiddenFields();

    // Disable the mobile matrix inputs so only canonical names POST
    document.querySelectorAll('.matrix-mobile input').forEach(inp => inp.disabled = true);

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Submitting…';

    try {
      const data = new FormData(form);
      // Convert FormData to URL-encoded body for Netlify
      const body = new URLSearchParams();
      for (const [k, v] of data.entries()) body.append(k, v);

      const resp = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!resp.ok && resp.status !== 200 && resp.status !== 303) {
        throw new Error(`Submit failed: ${resp.status}`);
      }
      showConfirmation();
    } catch (err) {
      // Local dev (no Netlify) or actual network failure — show confirmation anyway
      // for local testing, but log the error.
      console.warn('Form submit error (may be local-dev only):', err);
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        showConfirmation();
      } else {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Submit & book interview';
        alert('Submission failed. Please try again or contact Anthony directly.');
      }
    }
  });

  function showConfirmation() {
    form.hidden = true;
    progress.hidden = true;
    hero.hidden = true;
    confirmation.hidden = false;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      confirmation.focus?.();
    });
  }

  /* -----------------------------------------------------------
     Init
     ----------------------------------------------------------- */
  // Default: no role yet. All batteries disabled so nothing posts until role chosen.
  document.querySelectorAll('.battery input, .battery textarea').forEach(inp => inp.disabled = true);
  // All conditional follow-ups disabled by default
  document.querySelectorAll('.conditional input, .conditional textarea').forEach(inp => inp.disabled = true);

  showStep(0);
})();
