"""
Detect Labs - AI-Powered Industrial Visual Inspection & Quality Management
Production WSGI Application for Azure App Service
"""
import os
import json
import time
import random
import mimetypes
from urllib.parse import parse_qs

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_file_content(relative_subpath):
    """Robust file locator supporting both POSIX and Windows zip-extracted paths"""
    normalized = relative_subpath.replace('\\', '/')
    backslash_variant = relative_subpath.replace('/', '\\')
    
    candidates = [
        os.path.join(BASE_DIR, *normalized.split('/')),
        os.path.join(BASE_DIR, normalized),
        os.path.join(BASE_DIR, backslash_variant),
        os.path.join('/home/site/wwwroot', *normalized.split('/')),
        os.path.join('/home/site/wwwroot', backslash_variant)
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isfile(c):
            with open(c, 'rb') as f:
                return f.read()
    return None

def serve_static(environ, start_response, path):
    rel_path = path.lstrip('/')
    content = get_file_content(rel_path)
    
    if content is None:
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'Static File Not Found']

    mime_type, _ = mimetypes.guess_type(rel_path)
    if not mime_type:
        mime_type = 'application/octet-stream'

    headers = [
        ('Content-Type', mime_type),
        ('Content-Length', str(len(content))),
        ('Cache-Control', 'public, max-age=3600')
    ]
    start_response('200 OK', headers)
    return [content]

def serve_index(environ, start_response):
    content = get_file_content('templates/index.html')
    if content is None:
        content = get_file_content('index.html')
        
    if content is None:
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [b'Template index.html not found']

    headers = [
        ('Content-Type', 'text/html; charset=utf-8'),
        ('Content-Length', str(len(content))),
        ('Cache-Control', 'no-cache')
    ]
    start_response('200 OK', headers)
    return [content]
SYSTEM_STATE = {
    "system_name": "Detect Labs Visual Quality Engine",
    "version": "4.1.0-enterprise",
    "edge_node": "NVIDIA Jetson AGX Orin - Line 04",
    "status": "OPERATIONAL",
    "active_recipe": "MIL-SPEC-883 / IATF-16949 Precision",
    "inspected_total": 142850,
    "passed_total": 141680,
    "rejected_total": 1170,
    "first_pass_yield": 99.18,
    "current_ppm": 81.9,
    "oee_percentage": 94.6,
    "inference_fps": 118.4,
    "mean_latency_ms": 8.4,
    "conveyor_speed_mps": 1.25,
    "rejection_gate_latency_ms": 14.2
}

DEFECT_TYPES = [
    {"id": "DEF-01", "name": "Micro-Crack / Surface Fissure", "severity": "CRITICAL", "action": "AUTO-REJECT", "color": "#e63946"},
    {"id": "DEF-02", "name": "Sub-Surface Porosity Void", "severity": "CRITICAL", "action": "AUTO-REJECT", "color": "#d90429"},
    {"id": "DEF-03", "name": "Solder Bridge & Whisker", "severity": "MAJOR", "action": "REWORK-FLAG", "color": "#f59e0b"},
    {"id": "DEF-04", "name": "Particle Contamination (>5um)", "severity": "MAJOR", "action": "CLEAN-STATION", "color": "#ffb703"},
    {"id": "DEF-05", "name": "Dimensional Variance (+0.04mm)", "severity": "MINOR", "action": "WARN-CALIBRATE", "color": "#8b5cf6"},
    {"id": "DEF-06", "name": "Oxidation & Coating Thinning", "severity": "MINOR", "action": "LOG-TREND", "color": "#06b6d4"}
]

PRESET_MATERIALS = [
    {
        "id": "mat-wafer",
        "name": "Silicon Semiconductor Wafer (300mm)",
        "batch": "WAFER-LOT-882B",
        "nominal_thickness": "775 um",
        "tolerance": "+/- 2.5 um",
        "defects": [
            {"label": "Die-Edge Chipping", "box": [120, 140, 60, 50], "conf": 0.984, "severity": "CRITICAL"},
            {"label": "Photoresist Void", "box": [280, 210, 45, 40], "conf": 0.942, "severity": "MAJOR"}
        ]
    },
    {
        "id": "mat-casting",
        "name": "Cast Aluminum Engine Block Flange",
        "batch": "ALUM-CAST-9901",
        "nominal_thickness": "14.2 mm",
        "tolerance": "+/- 0.08 mm",
        "defects": [
            {"label": "Gas Blowhole Porosity", "box": [180, 160, 75, 65], "conf": 0.991, "severity": "CRITICAL"},
            {"label": "Surface Shrinkage Tear", "box": [340, 240, 90, 40], "conf": 0.978, "severity": "CRITICAL"}
        ]
    },
    {
        "id": "mat-pcb",
        "name": "High-Density Interconnect PCB Assembly",
        "batch": "SMT-PCBA-704",
        "nominal_thickness": "1.60 mm",
        "tolerance": "+/- 0.05 mm",
        "defects": [
            {"label": "IC Pin Solder Bridge", "box": [150, 190, 55, 45], "conf": 0.996, "severity": "CRITICAL"},
            {"label": "Missing 0402 Bypass Cap", "box": [310, 130, 35, 30], "conf": 0.965, "severity": "MAJOR"}
        ]
    },
    {
        "id": "mat-composite",
        "name": "Aerospace Carbon Fiber Prepreg Panel",
        "batch": "CFRP-AERO-X3",
        "nominal_thickness": "3.50 mm",
        "tolerance": "+/- 0.02 mm",
        "defects": [
            {"label": "Ply Delamination Void", "box": [210, 150, 80, 60], "conf": 0.987, "severity": "CRITICAL"}
        ]
    },
    {
        "id": "mat-battery",
        "name": "EV Lithium-Ion Pouch Cell Seam",
        "batch": "EV-BAT-CELL-402",
        "nominal_thickness": "8.80 mm",
        "tolerance": "+/- 0.03 mm",
        "defects": [
            {"label": "Thermal Seal Margin Breach", "box": [140, 220, 120, 35], "conf": 0.993, "severity": "CRITICAL"}
        ]
    }
]

def generate_spc_data():
    """Generates real-time Statistical Process Control points with UCL, LCL, Mean"""
    points = []
    base_val = 25.00
    for i in range(25):
        noise = (random.random() - 0.48) * 0.18
        points.append(round(base_val + noise, 3))
    return {
        "parameter": "Critical Bore Diameter (mm)",
        "nominal": 25.000,
        "ucl": 25.120,
        "lcl": 24.880,
        "usl": 25.150,
        "lsl": 24.850,
        "cpk": 1.68,
        "cp": 1.74,
        "sigma": 0.023,
        "points": points
    }

def get_telemetry():
    """Simulates real-time hardware telemetry updates"""
    SYSTEM_STATE["inspected_total"] += random.randint(1, 4)
    if random.random() < 0.04:
        SYSTEM_STATE["rejected_total"] += 1
    SYSTEM_STATE["passed_total"] = SYSTEM_STATE["inspected_total"] - SYSTEM_STATE["rejected_total"]
    SYSTEM_STATE["first_pass_yield"] = round((SYSTEM_STATE["passed_total"] / SYSTEM_STATE["inspected_total"]) * 100, 2)
    SYSTEM_STATE["current_ppm"] = round((SYSTEM_STATE["rejected_total"] / SYSTEM_STATE["inspected_total"]) * 1000000, 1)
    SYSTEM_STATE["inference_fps"] = round(118.0 + random.uniform(-3.5, 3.5), 1)
    SYSTEM_STATE["mean_latency_ms"] = round(8.3 + random.uniform(-0.4, 0.6), 1)
    return SYSTEM_STATE

def app(environ, start_response):
    path = environ.get('PATH_INFO', '/')
    method = environ.get('REQUEST_METHOD', 'GET').upper()

    # Routing
    if path == '/' or path == '/index.html':
        return serve_index(environ, start_response)

    elif path.startswith('/static/'):
        return serve_static(environ, start_response, path)

    elif path == '/favicon.ico' or path == '/favicon.png':
        return serve_static(environ, start_response, '/static/logo.png')

    elif path == '/api/health':
        data = {
            "status": "OPERATIONAL",
            "system": "Detect Labs Visual Quality Inspection Core",
            "version": "4.1.0-enterprise",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            "azure_host": "java-web-hsh6bvcxedfsgxah.centralindia-01.azurewebsites.net"
        }
        res_bytes = json.dumps(data).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(res_bytes)))])
        return [res_bytes]

    elif path == '/api/telemetry':
        data = get_telemetry()
        res_bytes = json.dumps(data).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(res_bytes)))])
        return [res_bytes]

    elif path == '/api/spc':
        data = generate_spc_data()
        res_bytes = json.dumps(data).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(res_bytes)))])
        return [res_bytes]

    elif path == '/api/defects':
        res_bytes = json.dumps(DEFECT_TYPES).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(res_bytes)))])
        return [res_bytes]

    elif path == '/api/materials':
        res_bytes = json.dumps(PRESET_MATERIALS).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(res_bytes)))])
        return [res_bytes]

    elif path == '/api/scan' and method == 'POST':
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
            body_bytes = environ['wsgi.input'].read(content_length) if content_length > 0 else b'{}'
            req_data = json.loads(body_bytes.decode('utf-8'))
        except Exception:
            req_data = {}

        mat_id = req_data.get('material_id', 'mat-wafer')
        mat_found = next((m for m in PRESET_MATERIALS if m['id'] == mat_id), PRESET_MATERIALS[0])

        # Synthesize scanning analysis
        has_flaws = req_data.get('simulate_defect', True)
        if has_flaws:
            detected = mat_found['defects']
            verdict = "REJECT" if any(d['severity'] == 'CRITICAL' for d in detected) else "REWORK"
        else:
            detected = []
            verdict = "PASS"

        response_payload = {
            "scan_id": f"SCN-{int(time.time()*1000)}",
            "material": mat_found['name'],
            "batch": mat_found['batch'],
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
            "inspection_duration_ms": round(random.uniform(7.8, 9.4), 2),
            "verdict": verdict,
            "defects_detected_count": len(detected),
            "defects": detected,
            "rejection_actuator_triggered": verdict == "REJECT",
            "iso_compliance": "ISO-9001:2015 §8.6 Compliant",
            "surface_roughness_ra": f"{round(random.uniform(0.12, 0.35), 3)} um",
            "operator_id": "OP-AI-AUTONOMOUS-09"
        }

        res_bytes = json.dumps(response_payload).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(res_bytes)))])
        return [res_bytes]

    elif path == '/api/export-audit':
        # Generate formal audit CSV
        rows = [
            "ScanID,Timestamp,Material,Batch,Verdict,DefectCount,LatencyMs,Inspector,Compliance",
        ]
        now = time.time()
        for i in range(30):
            t_str = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(now - i*45))
            m = PRESET_MATERIALS[i % len(PRESET_MATERIALS)]
            v = "PASS" if (i % 7 != 0) else "REJECT"
            d_cnt = 0 if v == "PASS" else random.randint(1, 3)
            lat = round(random.uniform(7.5, 9.8), 2)
            rows.append(f"SCN-{100000+i},{t_str},{m['name']},{m['batch']},{v},{d_cnt},{lat},DetectLabs-AI,IATF-16949")

        csv_content = "\r\n".join(rows).encode('utf-8')
        start_response('200 OK', [
            ('Content-Type', 'text/csv'),
            ('Content-Disposition', 'attachment; filename="DetectLabs_QualityAudit_BatchReport.csv"'),
            ('Content-Length', str(len(csv_content)))
        ])
        return [csv_content]

    else:
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'Endpoint Not Found']

# Gunicorn standard entry point
application = app

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    port = int(os.environ.get('PORT', 8000))
    print(f"Detect Labs Server starting on port {port}...")
    server = make_server('0.0.0.0', port, app)
    server.serve_forever()
