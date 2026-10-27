# Detect Labs
### AI-Powered Industrial Visual Inspection and Autonomous Quality Management

[![Deployment Status](https://img.shields.io/badge/Deployment-Live%20on%20Azure-success?style=flat-square&logo=microsoftazure)](https://java-web-hsh6bvcxedfsgxah.centralindia-01.azurewebsites.net)
[![System Architecture](https://img.shields.io/badge/Architecture-Edge%20AI%20%2B%20Cloud%20QMS-blue?style=flat-square)](#)
[![Compliance](https://img.shields.io/badge/Standards-ISO%209001%20%7C%20IATF%2016949-gold?style=flat-square)](#)
[![Theme Support](https://img.shields.io/badge/Themes-Dark%20(Red%2FGold)%20%7C%20Light%20(Violet%2FBlue)-purple?style=flat-square)](#)

**Live Production URL:** [https://java-web-hsh6bvcxedfsgxah.centralindia-01.azurewebsites.net](https://java-web-hsh6bvcxedfsgxah.centralindia-01.azurewebsites.net)

---

## Overview

**Detect Labs** is an enterprise-grade industrial visual inspection and quality control suite designed for semiconductor fabrication lines, automotive powertrain foundries, surface-mount technology (SMT) PCB assembly, aerospace composite manufacturing, and electric vehicle (EV) battery pouch inspection.

Equipped with sub-millisecond edge neural inferencing (120 FPS / 8.3ms latency) and closed-loop pneumatic rejection actuator triggering, Detect Labs enables autonomous inline optical inspection (AOI) to achieve 6-Sigma quality targets.

---

## Key Features

1. **High-Speed Optical Inspection HUD (Live Stream Simulation)**
   - Multi-camera input switching:
     - `CAM-01`: High-Resolution Telecentric Surface AOI
     - `CAM-02`: Infrared Sub-Surface Anomaly Profiler
     - `CAM-03`: 3D Laser Triangulation Profilometer
   - Animated laser scanner HUD overlay with moving raster bar.
   - Dynamic AI bounding boxes, defect classification, and confidence scoring.
   - Closed-loop pneumatic rejection gate simulation.

2. **Autonomous Material Scanner Workbench**
   - Interactive scanning canvas with laser sweep and audio-visual anomaly alarms (synthesized with the Web Audio API).
   - Presets for:
     - 300mm Silicon Semiconductor Wafer (Die-edge chipping, photoresist voids)
     - Cast Aluminum Engine Block Flange (Gas blowhole porosity, shrinkage tears)
     - High-Density Interconnect (HDI) PCB Assembly (IC solder bridges, missing passive capacitors)
     - Aerospace Carbon Fiber Prepreg Panel (Ply delaminations)
     - EV Lithium-Ion Battery Pouch Seam (Thermal seal margin breaches)
   - Component image uploader for custom part defect evaluation.

3. **Statistical Process Control (SPC) Analytics**
   - Real-time animated X-Bar and R control charts.
   - Dynamic tracking of Upper Control Limit (UCL = 25.120mm), Lower Control Limit (LCL = 24.880mm), and Nominal Mean (25.000mm).
   - Real-time $C_{pk}$ (1.68) and $C_p$ (1.74) capability metrics.

4. **Quality Management System (QMS) & Traceability**
   - Batch audit logs with unique scan IDs, timestamps, lot numbers, and verdicts (`PASS` / `REJECT` / `REWORK`).
   - One-click export for compliance reports (`DetectLabs_QualityAudit_BatchReport.csv`).
   - Audit adherence to ISO 9001:2015 §8.6 and IATF 16949:2016 traceability clauses.

5. **Industrial Dual-Theme Architecture**
   - **Dark Theme (Control Room Mode)**: Obsidian Black (`#08090b`), Hazard Crimson Red (`#e63946`), Honey Gold accents (`#ffb703`).
   - **Light Theme (Cleanroom Mode)**: Deep Violet (`#6d28d9`), Feather Blue mist (`#f0f7ff` / `#e0f2fe`), Slate contrast.

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Main Detect Labs Industrial Dashboard |
| `/api/health` | `GET` | Edge inference engine health and system status |
| `/api/telemetry` | `GET` | Real-time production telemetry (FPS, latency, FPY %, PPM) |
| `/api/spc` | `GET` | Statistical Process Control points, limits, and sigma values |
| `/api/defects` | `GET` | Complete defect taxonomy and severity rating catalog |
| `/api/materials` | `GET` | Preset industrial material specifications and inspection recipes |
| `/api/scan` | `POST` | Execute precision defect detection on selected or uploaded parts |
| `/api/export-audit` | `GET` | Downloadable CSV compliance audit report |

---

## Deployment Configuration

- **Host Platform:** Microsoft Azure App Service (Linux)
- **Runtime:** Python 3.12 WSGI / Gunicorn (24.1.1)
- **Deployment Protocol:** Azure ZipDeploy via Kudu SCM API
- **Live Endpoint:** `https://java-web-hsh6bvcxedfsgxah.centralindia-01.azurewebsites.net`
