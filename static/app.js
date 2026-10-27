/**
 * Detect Labs - Industrial Visual AI & Autonomous Quality Engineering Engine
 * Client-Side Controller & Real-Time Visualization Framework
 */

// Global theme switcher available immediately
window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
};

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
        document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem('detect_labs_theme', theme);
    
    const themeLabel = document.getElementById('theme-label-text');
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    // Safely trigger canvas redraws if functions are initialized
    if (typeof window.redrawAllCanvases === 'function') {
        window.redrawAllCanvases();
    }
}

// Apply saved theme immediately as script loads
(function() {
    const saved = localStorage.getItem('detect_labs_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('detect_labs_theme') || 'dark';
    applyTheme(savedTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.toggleTheme();
        });
    }

    // -------------------------------------------------------------------------
    // Audio Alert Engine (Synthesizer via Web Audio API)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    function playIndustrialAlarm(type = 'reject') {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'reject') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.25);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.12);
            }
        } catch (e) {
            // Audio policy fallback
        }
    }

    // -------------------------------------------------------------------------
    // SPC Chart State & Initialization
    // -------------------------------------------------------------------------
    const spcCanvas = document.getElementById('spcChartCanvas');
    const sCtx = spcCanvas ? spcCanvas.getContext('2d') : null;
    let spcData = [];
    const nominal = 25.000;
    const ucl = 25.120;
    const lcl = 24.880;

    for (let i = 0; i < 25; i++) {
        spcData.push(25.000 + (Math.random() - 0.48) * 0.16);
    }

    function drawSPCChart() {
        if (!sCtx || !spcCanvas) return;
        const parentW = spcCanvas.parentElement ? spcCanvas.parentElement.clientWidth : 700;
        const w = spcCanvas.width = parentW || 700;
        const h = spcCanvas.height = 150;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        sCtx.clearRect(0, 0, w, h);

        const padLeft = 60;
        const padRight = 30;
        const padTop = 25;
        const padBottom = 25;
        const chartW = w - padLeft - padRight;
        const chartH = h - padTop - padBottom;

        function valToY(val) {
            const minV = 24.80;
            const maxV = 25.20;
            return padTop + (1 - (val - minV) / (maxV - minV)) * chartH;
        }

        // Draw Limit Lines
        sCtx.strokeStyle = isDark ? '#e63946' : '#dc2626';
        sCtx.lineWidth = 1.5;
        sCtx.setLineDash([6, 4]);
        const yUcl = valToY(ucl);
        sCtx.beginPath();
        sCtx.moveTo(padLeft, yUcl);
        sCtx.lineTo(w - padRight, yUcl);
        sCtx.stroke();

        const yLcl = valToY(lcl);
        sCtx.beginPath();
        sCtx.moveTo(padLeft, yLcl);
        sCtx.lineTo(w - padRight, yLcl);
        sCtx.stroke();

        sCtx.strokeStyle = isDark ? '#ffb703' : '#7c3aed';
        sCtx.setLineDash([]);
        const yNom = valToY(nominal);
        sCtx.beginPath();
        sCtx.moveTo(padLeft, yNom);
        sCtx.lineTo(w - padRight, yNom);
        sCtx.stroke();

        sCtx.fillStyle = isDark ? '#94a3b8' : '#334155';
        sCtx.font = '10px monospace';
        sCtx.fillText('UCL 25.120', 4, yUcl + 3);
        sCtx.fillText('NOM 25.000', 4, yNom + 3);
        sCtx.fillText('LCL 24.880', 4, yLcl + 3);

        sCtx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
        sCtx.lineWidth = 2;
        sCtx.beginPath();

        const stepX = chartW / (spcData.length - 1);
        spcData.forEach((pt, i) => {
            const px = padLeft + i * stepX;
            const py = valToY(pt);
            if (i === 0) sCtx.moveTo(px, py);
            else sCtx.lineTo(px, py);
        });
        sCtx.stroke();

        spcData.forEach((pt, i) => {
            const px = padLeft + i * stepX;
            const py = valToY(pt);
            const isOOC = pt > ucl || pt < lcl;

            sCtx.fillStyle = isOOC ? (isDark ? '#e63946' : '#dc2626') : (isDark ? '#ffb703' : '#7c3aed');
            sCtx.beginPath();
            sCtx.arc(px, py, isOOC ? 5 : 3, 0, Math.PI * 2);
            sCtx.fill();
        });
    }

    // -------------------------------------------------------------------------
    // Live Vision HUD & Conveyor Canvas
    // -------------------------------------------------------------------------
    const visionCanvas = document.getElementById('inspectionCanvas');
    const vCtx = visionCanvas ? visionCanvas.getContext('2d') : null;
    let laserHudActive = true;
    let bboxActive = true;
    let cameraMode = 'cam-01';
    let scanLineX = 50;
    let scanDirection = 2.4;

    const toggleLaserBtn = document.getElementById('toggle-laser-btn');
    if (toggleLaserBtn) {
        toggleLaserBtn.addEventListener('click', () => {
            laserHudActive = !laserHudActive;
            toggleLaserBtn.classList.toggle('active', laserHudActive);
            toggleLaserBtn.textContent = `LASER HUD: ${laserHudActive ? 'ON' : 'OFF'}`;
        });
    }

    const toggleBboxBtn = document.getElementById('toggle-bbox-btn');
    if (toggleBboxBtn) {
        toggleBboxBtn.addEventListener('click', () => {
            bboxActive = !bboxActive;
            toggleBboxBtn.classList.toggle('active', bboxActive);
            toggleBboxBtn.textContent = `B-BOX: ${bboxActive ? 'ON' : 'OFF'}`;
        });
    }

    const camSelect = document.getElementById('camera-source-select');
    if (camSelect) {
        camSelect.addEventListener('change', (e) => {
            cameraMode = e.target.value;
        });
    }

    function drawLiveVision() {
        if (!vCtx || !visionCanvas) return;
        const w = visionCanvas.width;
        const h = visionCanvas.height;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        vCtx.fillStyle = isDark ? '#07080b' : '#e0f0fe';
        vCtx.fillRect(0, 0, w, h);

        vCtx.strokeStyle = isDark ? '#1a1f2c' : '#93c5fd';
        vCtx.lineWidth = 2;
        vCtx.beginPath();
        vCtx.moveTo(0, 70);
        vCtx.lineTo(w, 70);
        vCtx.moveTo(0, h - 70);
        vCtx.lineTo(w, h - 70);
        vCtx.stroke();

        const centerX = w / 2;
        const centerY = h / 2;

        if (cameraMode === 'cam-01') {
            const radius = 135;
            const grad = vCtx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
            if (isDark) {
                grad.addColorStop(0, '#1e293b');
                grad.addColorStop(0.7, '#0f172a');
                grad.addColorStop(1, '#020617');
            } else {
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.7, '#cbd5e1');
                grad.addColorStop(1, '#94a3b8');
            }

            vCtx.fillStyle = grad;
            vCtx.beginPath();
            vCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            vCtx.fill();
            vCtx.strokeStyle = isDark ? '#38bdf8' : '#7c3aed';
            vCtx.lineWidth = 1.5;
            vCtx.stroke();

            vCtx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(124, 58, 237, 0.15)';
            vCtx.lineWidth = 1;
            const step = 22;
            for (let x = centerX - radius + 15; x <= centerX + radius - 15; x += step) {
                vCtx.beginPath();
                vCtx.moveTo(x, centerY - radius + 15);
                vCtx.lineTo(x, centerY + radius - 15);
                vCtx.stroke();
            }
            for (let y = centerY - radius + 15; y <= centerY + radius - 15; y += step) {
                vCtx.beginPath();
                vCtx.moveTo(centerX - radius + 15, y);
                vCtx.lineTo(centerX + radius - 15, y);
                vCtx.stroke();
            }
        } else if (cameraMode === 'cam-02') {
            vCtx.fillStyle = isDark ? '#1a0505' : '#fed7aa';
            vCtx.fillRect(centerX - 160, centerY - 100, 320, 200);

            const tGrad = vCtx.createRadialGradient(centerX - 30, centerY, 10, centerX - 30, centerY, 90);
            tGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
            tGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
            tGrad.addColorStop(1, 'transparent');
            vCtx.fillStyle = tGrad;
            vCtx.fillRect(centerX - 160, centerY - 100, 320, 200);
        } else {
            vCtx.strokeStyle = isDark ? '#10b981' : '#059669';
            vCtx.lineWidth = 1.5;
            for (let i = 0; i < 9; i++) {
                vCtx.beginPath();
                vCtx.moveTo(centerX - 180, centerY - 80 + i * 20);
                vCtx.bezierCurveTo(centerX - 60, centerY - 95 + i * 20, centerX + 60, centerY - 65 + i * 20, centerX + 180, centerY - 80 + i * 20);
                vCtx.stroke();
            }
        }

        if (bboxActive) {
            const bx = centerX - 65;
            const by = centerY - 55;
            const bw = 130;
            const bh = 85;

            const boxColor = isDark ? '#e63946' : '#dc2626';
            vCtx.strokeStyle = boxColor;
            vCtx.lineWidth = 2;
            vCtx.strokeRect(bx, by, bw, bh);

            vCtx.fillStyle = isDark ? '#ffb703' : '#7c3aed';
            vCtx.fillRect(bx - 2, by - 2, 8, 3);
            vCtx.fillRect(bx - 2, by - 2, 3, 8);
            vCtx.fillRect(bx + bw - 6, by - 2, 8, 3);
            vCtx.fillRect(bx + bw - 1, by - 2, 3, 8);

            vCtx.fillStyle = boxColor;
            vCtx.fillRect(bx, by - 22, bw, 22);
            vCtx.fillStyle = '#ffffff';
            vCtx.font = 'bold 11px monospace';
            vCtx.fillText('MICRO-CRACK 99.4%', bx + 6, by - 6);

            vCtx.fillStyle = isDark ? '#94a3b8' : '#334155';
            vCtx.font = '10px monospace';
            vCtx.fillText(`[X:${bx} Y:${by}] AREA: 11050 px²`, bx, by + bh + 14);
        }

        if (laserHudActive) {
            scanLineX += scanDirection;
            if (scanLineX > w - 40 || scanLineX < 40) {
                scanDirection = -scanDirection;
            }

            const laserColor = isDark ? '#e63946' : '#7c3aed';
            vCtx.save();
            vCtx.shadowColor = laserColor;
            vCtx.shadowBlur = 14;
            vCtx.strokeStyle = laserColor;
            vCtx.lineWidth = 2.5;
            vCtx.beginPath();
            vCtx.moveTo(scanLineX, 20);
            vCtx.lineTo(scanLineX, h - 20);
            vCtx.stroke();
            vCtx.restore();
        }

        requestAnimationFrame(drawLiveVision);
    }

    if (vCtx) {
        requestAnimationFrame(drawLiveVision);
    }

    // -------------------------------------------------------------------------
    // Material Scanner Stage
    // -------------------------------------------------------------------------
    const materialCanvas = document.getElementById('materialCanvas');
    const mCtx = materialCanvas ? materialCanvas.getContext('2d') : null;
    const materialSelect = document.getElementById('material-select') || document.getElementById('materialSelect');
    const triggerScanBtn = document.getElementById('trigger-scan-btn');
    const laserScannerLine = document.getElementById('laserScannerLine');
    const simulationToggle = document.getElementById('defect-simulation-toggle');
    const simLabel = document.getElementById('simulation-toggle-label');
    const alarmBanner = document.getElementById('alarm-banner');
    const resScanId = document.getElementById('res-scan-id');
    const resScanTime = document.getElementById('res-scan-time');
    const resScanVerdict = document.getElementById('res-scan-verdict');
    const defectsTableBody = document.getElementById('defects-table-body');
    const fileInput = document.getElementById('material-file-input');

    let currentLoadedImage = null;

    function drawMaterialStage() {
        if (!mCtx || !materialCanvas) return;
        const w = materialCanvas.width;
        const h = materialCanvas.height;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const matType = materialSelect ? materialSelect.value : 'mat-wafer';

        mCtx.clearRect(0, 0, w, h);
        mCtx.fillStyle = isDark ? '#0b0d12' : '#ffffff';
        mCtx.fillRect(0, 0, w, h);

        if (currentLoadedImage) {
            mCtx.drawImage(currentLoadedImage, 40, 20, w - 80, h - 40);
            return;
        }

        if (matType === 'mat-wafer') {
            mCtx.fillStyle = isDark ? '#1e293b' : '#cbd5e1';
            mCtx.beginPath();
            mCtx.arc(w / 2, h / 2, 95, 0, Math.PI * 2);
            mCtx.fill();
            mCtx.strokeStyle = isDark ? '#ffb703' : '#7c3aed';
            mCtx.lineWidth = 1.5;
            mCtx.stroke();
        } else if (matType === 'mat-pcb') {
            mCtx.fillStyle = isDark ? '#064e3b' : '#bbf7d0';
            mCtx.fillRect(60, 30, w - 120, h - 60);
            mCtx.fillStyle = isDark ? '#1e293b' : '#475569';
            mCtx.fillRect(100, 60, 40, 40);
            mCtx.fillRect(180, 80, 70, 50);
            mCtx.fillRect(290, 70, 50, 40);
        } else if (matType === 'mat-composite') {
            mCtx.fillStyle = isDark ? '#111827' : '#94a3b8';
            mCtx.fillRect(40, 25, w - 80, h - 50);
        } else {
            mCtx.fillStyle = isDark ? '#334155' : '#94a3b8';
            mCtx.fillRect(50, 35, w - 100, h - 70);
        }
    }

    if (materialSelect) {
        materialSelect.addEventListener('change', () => {
            currentLoadedImage = null;
            drawMaterialStage();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const img = new Image();
                    img.onload = () => {
                        currentLoadedImage = img;
                        drawMaterialStage();
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (simulationToggle && simLabel) {
        simulationToggle.addEventListener('change', () => {
            simLabel.textContent = simulationToggle.checked ? 'Flaws Present (Reject Test)' : 'Pristine Material (Pass Test)';
        });
    }

    if (triggerScanBtn) {
        triggerScanBtn.addEventListener('click', async () => {
            triggerScanBtn.disabled = true;
            triggerScanBtn.innerHTML = `SCANNING IN PROGRESS...`;

            if (laserScannerLine) {
                laserScannerLine.classList.add('scanning');
            }

            const matId = materialSelect ? materialSelect.value : 'mat-wafer';
            const hasDefects = simulationToggle ? simulationToggle.checked : true;

            try {
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ material_id: matId, simulate_defect: hasDefects })
                });
                const data = await response.json();

                setTimeout(() => {
                    if (laserScannerLine) {
                        laserScannerLine.classList.remove('scanning');
                    }
                    triggerScanBtn.disabled = false;
                    triggerScanBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="7" y1="12" x2="17" y2="12"></line></svg>
                        EXECUTE PRECISION SCAN
                    `;

                    if (resScanId) resScanId.textContent = data.scan_id;
                    if (resScanTime) resScanTime.textContent = `${data.inspection_duration_ms} ms`;
                    if (resScanVerdict) {
                        resScanVerdict.textContent = data.verdict;
                        resScanVerdict.className = `badge-verdict-large ${data.verdict.toLowerCase()}`;
                    }

                    if (defectsTableBody) {
                        defectsTableBody.innerHTML = '';
                        if (data.defects && data.defects.length > 0) {
                            data.defects.forEach(df => {
                                const tr = document.createElement('tr');
                                const isCrit = df.severity === 'CRITICAL';
                                tr.innerHTML = `
                                    <td><span class="defect-bullet ${isCrit ? 'critical' : 'major'}"></span> ${df.label}</td>
                                    <td><strong>${(df.conf * 100).toFixed(1)}%</strong></td>
                                    <td>X:${df.box[0]}, Y:${df.box[1]} (${df.box[2]}x${df.box[3]})</td>
                                    <td><span class="${isCrit ? 'tag-crit' : 'tag-maj'}">${df.severity}</span></td>
                                    <td><span class="${isCrit ? 'tag-reject' : 'tag-rework'}">${isCrit ? 'AUTO-REJECT' : 'REWORK STATION'}</span></td>
                                `;
                                defectsTableBody.appendChild(tr);
                            });

                            if (alarmBanner) {
                                alarmBanner.classList.remove('hidden');
                                setTimeout(() => alarmBanner.classList.add('hidden'), 4500);
                            }
                            playIndustrialAlarm('reject');
                        } else {
                            defectsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--status-pass); font-weight:700;">Zero Anomalies Detected. Material Passes Specifications.</td></tr>`;
                            playIndustrialAlarm('pass');
                        }
                    }

                    addAuditEntry(data);
                }, 1800);

            } catch (err) {
                if (laserScannerLine) laserScannerLine.classList.remove('scanning');
                triggerScanBtn.disabled = false;
                triggerScanBtn.textContent = 'EXECUTE PRECISION SCAN';
            }
        });
    }

    // -------------------------------------------------------------------------
    // QMS Audit Table
    // -------------------------------------------------------------------------
    const auditTableBody = document.getElementById('audit-table-body');
    const auditSearch = document.getElementById('audit-search');

    const auditRecords = [
        { id: 'SCN-17298501', time: '15:22:10 UTC', mat: 'Silicon Wafer (300mm)', lot: 'LOT-992-B', verdict: 'PASS', defects: 0, lat: '8.2 ms', op: 'DetectLabs-AI', std: 'IATF-16949' },
        { id: 'SCN-17298502', time: '15:22:18 UTC', mat: 'Cast Aluminum Flange', lot: 'ALUM-8840', verdict: 'REJECT', defects: 2, lat: '8.5 ms', op: 'DetectLabs-AI', std: 'ISO-9001' },
        { id: 'SCN-17298503', time: '15:22:25 UTC', mat: 'HDI PCB Motherboard', lot: 'SMT-7701', verdict: 'PASS', defects: 0, lat: '7.9 ms', op: 'DetectLabs-AI', std: 'MIL-SPEC' },
        { id: 'SCN-17298504', time: '15:22:31 UTC', mat: 'Carbon Fiber Prepreg', lot: 'AERO-X3', verdict: 'PASS', defects: 0, lat: '8.4 ms', op: 'DetectLabs-AI', std: 'AS9100D' },
        { id: 'SCN-17298505', time: '15:22:42 UTC', mat: 'EV Battery Pouch Seam', lot: 'BAT-4009', verdict: 'REJECT', defects: 1, lat: '8.8 ms', op: 'DetectLabs-AI', std: 'IATF-16949' }
    ];

    function renderAuditTable(records) {
        if (!auditTableBody) return;
        auditTableBody.innerHTML = '';
        records.forEach(rec => {
            const tr = document.createElement('tr');
            const isPass = rec.verdict === 'PASS';
            tr.innerHTML = `
                <td><strong>${rec.id}</strong></td>
                <td>${rec.time}</td>
                <td>${rec.mat}</td>
                <td><span class="highlight-code">${rec.lot}</span></td>
                <td><span class="badge-verdict ${isPass ? 'pass' : 'reject'}">${rec.verdict}</span></td>
                <td>${rec.defects}</td>
                <td>${rec.lat}</td>
                <td>${rec.op}</td>
                <td><small>${rec.std}</small></td>
            `;
            auditTableBody.appendChild(tr);
        });
    }

    function addAuditEntry(scanResult) {
        const newRec = {
            id: scanResult.scan_id,
            time: new Date().toISOString().substring(11, 19) + ' UTC',
            mat: scanResult.material,
            lot: scanResult.batch,
            verdict: scanResult.verdict,
            defects: scanResult.defects_detected_count,
            lat: `${scanResult.inspection_duration_ms} ms`,
            op: scanResult.operator_id,
            std: 'IATF-16949'
        };
        auditRecords.unshift(newRec);
        if (auditRecords.length > 50) auditRecords.pop();
        renderAuditTable(auditRecords);
    }

    if (auditSearch) {
        auditSearch.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            const filtered = auditRecords.filter(r => 
                r.mat.toLowerCase().includes(q) ||
                r.lot.toLowerCase().includes(q) ||
                r.verdict.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q)
            );
            renderAuditTable(filtered);
        });
    }

    // -------------------------------------------------------------------------
    // Real-Time Telemetry Poller
    // -------------------------------------------------------------------------
    const kpiFpy = document.getElementById('kpi-fpy');
    const kpiPpm = document.getElementById('kpi-ppm');
    const kpiInspected = document.getElementById('kpi-inspected');
    const kpiPassed = document.getElementById('kpi-passed');
    const kpiRejected = document.getElementById('kpi-rejected');
    const liveFps = document.getElementById('live-fps');
    const liveLatency = document.getElementById('live-latency');
    const telemetryTime = document.getElementById('telemetry-time');

    async function pollTelemetry() {
        try {
            const res = await fetch('/api/telemetry');
            if (res.ok) {
                const data = await res.json();
                if (kpiFpy) kpiFpy.textContent = `${data.first_pass_yield}%`;
                if (kpiPpm) kpiPpm.textContent = data.current_ppm;
                if (kpiInspected) kpiInspected.textContent = data.inspected_total.toLocaleString();
                if (kpiPassed) kpiPassed.textContent = data.passed_total.toLocaleString();
                if (kpiRejected) kpiRejected.textContent = data.rejected_total.toLocaleString();
                if (liveFps) liveFps.textContent = data.inference_fps;
                if (liveLatency) liveLatency.textContent = `${data.mean_latency_ms} ms`;
                if (telemetryTime) telemetryTime.textContent = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
            }
        } catch (e) {
            // Local fallback
        }
    }

    setInterval(pollTelemetry, 3000);

    // Dynamic SPC Point Drift
    setInterval(() => {
        spcData.shift();
        const nextPt = 25.000 + (Math.random() - 0.48) * 0.17;
        spcData.push(nextPt);
        drawSPCChart();
    }, 2500);

    // Expose redraw function for theme switcher
    window.redrawAllCanvases = function() {
        drawMaterialStage();
        drawSPCChart();
    };

    // Initial render
    drawMaterialStage();
    drawSPCChart();
    renderAuditTable(auditRecords);

    window.addEventListener('resize', () => {
        drawSPCChart();
    });
});
